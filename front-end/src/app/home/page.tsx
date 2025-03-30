import styles from "./home.module.css";

const cssStyles = [
  { id: 1, name: "Estilo Moderno", description: "Um design limpo e moderno." },
  { id: 2, name: "Estilo Minimalista", description: "Foco na simplicidade e funcionalidade." },
  { id: 3, name: "Estilo Retro", description: "Design inspirado nos anos 80 e 90." },
  { id: 4, name: "Estilo Futurista", description: "Visual inovador e tecnológico." },
];

export default function HomePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Estilos de CSS Disponíveis</h1>
      <div className={styles.grid}>
        {cssStyles.map((style) => (
          <div key={style.id} className={styles.card}>
            <h2>{style.name}</h2>
            <p>{style.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}