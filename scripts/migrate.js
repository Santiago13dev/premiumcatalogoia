#!/usr/bin/env node

// Database migration script

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const migrations = [
  {
    version: '1.0.0',
    description: 'Initial schema setup',
    up: async () => {
      console.log('Setting up initial indexes...');
      const db = mongoose.connection.db;
      
      // Create indexes
      await db.collection('components').createIndex({ name: 'text', description: 'text' });
      await db.collection('components').createIndex({ type: 1, tags: 1 });
      await db.collection('components').createIndex({ createdAt: -1 });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
    },
    down: async () => {
      console.log('Dropping indexes...');
      const db = mongoose.connection.db;
      await db.collection('components').dropIndexes();
      await db.collection('users').dropIndexes();
    }
  },
  {
    version: '1.1.0',
    description: 'Add analytics collection',
    up: async () => {
      console.log('Creating analytics collection...');
      const db = mongoose.connection.db;
      await db.createCollection('analytics');
      await db.collection('analytics').createIndex({ componentId: 1, type: 1, createdAt: -1 });
      await db.collection('analytics').createIndex({ userId: 1, createdAt: -1 });
    },
    down: async () => {
      console.log('Dropping analytics collection...');
      const db = mongoose.connection.db;
      await db.collection('analytics').drop();
    }
  },
  {
    version: '1.2.0',
    description: 'Add audit logs collection',
    up: async () => {
      console.log('Creating audit logs collection...');
      const db = mongoose.connection.db;
      await db.createCollection('auditlogs');
      await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1 });
      await db.collection('auditlogs').createIndex({ action: 1, timestamp: -1 });
    },
    down: async () => {
      console.log('Dropping audit logs collection...');
      const db = mongoose.connection.db;
      await db.collection('auditlogs').drop();
    }
  }
];

class Migrator {
  constructor() {
    this.migrations = migrations;
  }
  
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/premiumcatalogoia');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }
  
  async getCurrentVersion() {
    const db = mongoose.connection.db;
    try {
      const migration = await db.collection('migrations').findOne({}, { sort: { version: -1 } });
      return migration ? migration.version : '0.0.0';
    } catch {
      await db.createCollection('migrations');
      return '0.0.0';
    }
  }
  
  async setVersion(version) {
    const db = mongoose.connection.db;
    await db.collection('migrations').insertOne({
      version,
      migratedAt: new Date()
    });
  }
  
  async up() {
    const currentVersion = await this.getCurrentVersion();
    console.log(`Current version: ${currentVersion}`);
    
    const pending = this.migrations.filter(m => m.version > currentVersion);
    
    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    for (const migration of pending) {
      console.log(`\nRunning migration ${migration.version}: ${migration.description}`);
      try {
        await migration.up();
        await this.setVersion(migration.version);
        console.log(`✓ Migration ${migration.version} completed`);
      } catch (error) {
        console.error(`✗ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
    
    console.log('\nAll migrations completed successfully');
  }
  
  async down(targetVersion = '0.0.0') {
    const currentVersion = await this.getCurrentVersion();
    console.log(`Current version: ${currentVersion}`);
    console.log(`Target version: ${targetVersion}`);
    
    const toRevert = this.migrations
      .filter(m => m.version <= currentVersion && m.version > targetVersion)
      .reverse();
    
    if (toRevert.length === 0) {
      console.log('No migrations to revert');
      return;
    }
    
    for (const migration of toRevert) {
      console.log(`\nReverting migration ${migration.version}: ${migration.description}`);
      try {
        await migration.down();
        console.log(`✓ Migration ${migration.version} reverted`);
      } catch (error) {
        console.error(`✗ Failed to revert migration ${migration.version}:`, error);
        throw error;
      }
    }
    
    console.log('\nRollback completed');
  }
  
  async run() {
    await this.connect();
    
    const command = process.argv[2] || 'up';
    
    try {
      switch (command) {
        case 'up':
          await this.up();
          break;
        case 'down':
          await this.down(process.argv[3]);
          break;
        case 'status':
          const version = await this.getCurrentVersion();
          console.log(`Current version: ${version}`);
          break;
        default:
          console.log('Usage: migrate.js [up|down|status] [version]');
      }
    } finally {
      await mongoose.disconnect();
    }
  }
}

// Run migrations
const migrator = new Migrator();
migrator.run().catch(console.error);