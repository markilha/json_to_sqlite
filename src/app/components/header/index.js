import styles from "./header.module.css";
function Header() {
  return (
    <header className={styles.header}>
      <div>
        <span>CONVETER JSON EM SQL</span>
      </div>
    </header>
  );
}

export default Header;
