import { useState } from "react";

/* Cards interativos das marcas na página inicial */
type BrandFlipCardProps = {
  name: string;
  image: string;
  logo: string;
  description: string;
};

export default function BrandFlipCard({ name, image, logo, description }: BrandFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`brand-flip-card ${flipped ? "is-flipped" : ""}`}
      onClick={() => setFlipped((value) => !value)}
      aria-label={`${name}: ${flipped ? "voltar à foto" : "ler sobre a marca"}`}
      aria-pressed={flipped}
    >
      <span className="brand-flip-inner">
        {/* FRENTE — SOMENTE A FOTO */}

        <span className="brand-flip-front">
          <img
            src={image}
            alt=""
            loading="eager"
            className={
              name === "Franuí" || name === "Grupo Bimbo"
                ? "brand-flip-image--contain"
                : undefined
            }
          />
          <span className="brand-flip-center" aria-hidden="true">
            <i className="fa-solid fa-rotate" />
          </span>
        </span>

        {/* VERSO — INFORMAÇÕES DA EMPRESA */}
        <span className="brand-flip-back">
          <img
            className="brand-flip-watermark"
            src={logo}
            alt=""
            aria-hidden="true"
          />

          <span className="brand-flip-content">
            <strong>{name}</strong>

            <span className="brand-flip-description">{description}</span>

            <small>Clique para voltar ↩</small>
          </span>
        </span>
      </span>
    </button>
  );
}

