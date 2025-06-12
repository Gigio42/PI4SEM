import React from 'react';
import styles from './ComponentCardSkeleton.module.css';

export default function ComponentCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.header}>
        <div className={styles.titleSkeleton}></div>
        <div className={styles.categorySkeletonContainer}>
          <div className={styles.categorySkeleton}></div>
        </div>
      </div>
      
      <div className={styles.preview}>
        <div className={styles.previewSkeleton}></div>
      </div>
      
      <div className={styles.body}>
        <div className={styles.metaSkeleton}></div>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.buttonSkeleton}></div>
        <div className={styles.buttonSkeleton}></div>
      </div>
    </div>
  );
}
