import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';

/**
 * InView component inspired by Motion Primitives.
 * Triggers Framer/Motion variant animations when the element enters the viewport.
 */
export function InView({
  children,
  variants,
  transition = { duration: 0.4, ease: 'easeOut' },
  viewOptions = { once: false, margin: '0px 0px -80px 0px' },
  as = 'div',
  className = '',
  style = {},
  ...props
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const MotionComponent = motion[as] || motion.div;

  const defaultVariants = {
    hidden: {
      opacity: 0,
      y: 24,
      scale: 0.98,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
    },
  };

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants || defaultVariants}
      transition={transition}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
export default InView;
