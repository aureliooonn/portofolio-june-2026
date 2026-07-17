import { memo } from 'react';

/* Animated nebula backdrop — drifting gradient blobs */
export default memo(function Nebula() {
  return (
    <div className="nebula" aria-hidden="true">
      <div className="nebula__blob nebula__blob--1" />
      <div className="nebula__blob nebula__blob--2" />
      <div className="nebula__blob nebula__blob--3" />
    </div>
  );
});
