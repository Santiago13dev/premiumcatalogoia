import { useState, useEffect, useCallback } from 'react';

function useInfiniteScroll(callback, hasMore) {
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) {
      return;
    }
    if (hasMore && !loading) {
      setLoading(true);
      callback().finally(() => setLoading(false));
    }
  }, [callback, hasMore, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { loading };
}

export default useInfiniteScroll;