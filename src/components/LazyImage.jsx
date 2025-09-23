import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, className, fallbackSrc }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    let observer;
    const currentImg = imgRef.current;

    if (currentImg) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(currentImg);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(currentImg);
    }

    return () => {
      if (observer && currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      {imageSrc && (
        <img
          src={imageError && fallbackSrc ? fallbackSrc : imageSrc}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default React.memo(LazyImage);