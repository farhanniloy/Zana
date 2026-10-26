import React from 'react';
import UserManager from '@/components/admin/UserManager';
import styles from './usersPage.module.css';

const Page = () => {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Admin — Users</h1>
      <UserManager />
    </main>
  );
};

export default Page;
