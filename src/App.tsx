import { useEffect, useMemo, useState } from "react";
import productsData from "../data/products.json";
import AdminDashboard from "./components/AdminDashboard";
import QuoteCart, { type CartItem } from "./components/QuoteCart.tsx";
import {
  trackEvent,
  submitReview,
  fetchAdminStats,
  signInAdmin,
  analyticsConfigured,
  submitQuote,
  type AdminStats,
} from "../analytics.ts";

type Product = {
  id: string;
  name: string;
  brand: string;
  unit: string;
  price?: number;
  available?: boolean;
  barcode?: string;
  supplierCode?: string;
  supplierName?: string;
  image?: string;
};

type Tab = "speers" | "fornecedores" | "produtos" | "solucoes" | "avaliacoes";

const PRODUCTS = (productsData as Product[]).filter(
  (product) => product.available !== false,
);

const BRAND_LOGOS: Record<string, string> = {
  "forno de minas": "/forno-de-minas-logo.jpg",
  mccain: "/mccain-logo.png",
  franui: "/franui-logo.png",
  franuí: "/franui-logo.png",
  minerva: "/minerva-foods-logo.jpg",
  "minerva s/a": "/minerva-foods-logo.jpg",

  bimbo: "/bimbo-logo.jpg",
  grano: "/grano foods.jpg",
  BONDUELLE: "/logo-bonduelle.jpg",

  "bimbo do brasil": "/bimbo-logo.jpg",
  "lar cooperativa": "/lar cooperativa agroindustrial.png",
  "grupo bimbo": "/bimbo-logo.jpg",
  frooty: "/frooty-logo.png",
  "fazenda futuro": "/fazenda futuro.png",
};

const FEATURED_BRANDS = [
  {
    label: "Forno de Minas",
    logo: "/forno-de-minas-logo.jpg",
    search: "FORNO DE MINAS ALIMENTOS S/A",
  },
  {
    label: "Grano Foods",
    logo: "/grano foods.jpg",
    search: "GRANO ALIMENTOS S/A",
  },
  {
    label: "BONDUELLE",
    logo: "/logo-bonduelle.jpg",
    search: "BONDUELLE",
  },
  {
    label: "Lar Cooperativa",
    logo: "/lar cooperativa agroindustrial.png",
    search: "LAR COOPERATIVA AGROINDUSTRIAL",
  },
  {
    label: "McCain",
    logo: "/mccain-logo.png",
    search: "MC CAIN DO BRASIL ALIMENTOS",
  },
  {
    label: "Franui",
    logo: "/franui-logo.png",
    search: "FRANUÍ",
  },
  {
    label: "Minerva",
    logo: "/minerva-foods-logo.jpg",
    search: "MINERVA S/A",
  },
  {
    label: "Bimbo",
    logo: "/bimbo-logo.jpg",
    search: "BIMBO DO BRASIL",
  },
  {
    label: "Frooty",
    logo: "/frooty-logo.png",
    search: "FROOTY COMERCIO E INDUSTRIA DE ALIMENTOS S.A.",
  },
  {
    label: "Fazenda Futuro",
    logo: "/fazenda futuro.png",
    search: "FAZENDA FUTURO PRODUTOS ALIMENTICIOS SA",
  },
];

const normalize = (value = "") =>
  value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const tabLabels: Record<Tab, string> = {
  speers: "Quem somos",
  fornecedores: "Trabalhe conosco",
  produtos: "Produtos",
  solucoes: "Soluções para seu negócio",
  avaliacoes: "Avalie-nos",
};

/* Cards interativos das marcas na página inicial */
type BrandFlipCardProps = {
  name: string;
  image: string;
  logo: string;
  description: string;
};

function BrandFlipCard({ name, image, logo, description }: BrandFlipCardProps) {
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

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("speers");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerType, setCustomerType] = useState("Restaurante");
  const [customerRegion, setCustomerRegion] = useState("");
  const [customerNeed, setCustomerNeed] = useState("");
  const [siteRating, setSiteRating] = useState(0);
  const [purchaseRating, setPurchaseRating] = useState(0);
  const [reviewStatus, setReviewStatus] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try {
      const raw = JSON.parse(
        localStorage.getItem("speers_quote_cart_v1") || "{}",
      );
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
      return Object.fromEntries(
        Object.entries(raw).filter(
          ([id, qty]) =>
            PRODUCTS.some((p) => p.id === id) &&
            typeof qty === "number" &&
            Number.isInteger(qty) &&
            qty > 0 &&
            qty <= 9999,
        ),
      ) as Record<string, number>;
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("speers_quote_cart_v1", JSON.stringify(cart));
    } catch {
      /* storage indisponível */
    }
  }, [cart]);
  const cartItems: CartItem[] = PRODUCTS.filter((p) => cart[p.id] > 0).map(
    (p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      unit: p.unit,
      image: p.image,
      quantity: cart[p.id],
    }),
  );
  const cartCount = cartItems.reduce((total, p) => total + p.quantity, 0);
  const setQuantity = (id: string, quantity: number) =>
    setCart((previous) => {
      const next = { ...previous };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(9999, Math.max(1, Math.floor(quantity)));
      return next;
    });
  const itemsPerPage = 24;

  // Abertura exibida apenas ao carregar a página, nunca ao mudar de aba.
  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setWelcomeLeaving(true), 2700);
    const removeTimer = window.setTimeout(() => setShowWelcome(false), 3300);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    void trackEvent("visit");
  }, []);
  const sendCustomerRequest = () => {
    void trackEvent("contact_request", {
      source: "solucoes",
      customer_type: customerType,
    });
    const message = `Olá! Gostaria de atendimento comercial da Speers Foods.\nTipo de cliente: ${customerType}\nCidade ou bairro: ${customerRegion.trim()}\nO que preciso: ${customerNeed.trim()}`;
    window.open(
      `https://wa.me/5511913682491?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const sendReview = async () => {
    setReviewStatus("Enviando...");
    try {
      await submitReview(siteRating, purchaseRating);
      setReviewStatus("Obrigado! Sua avaliação foi registrada.");
      setSiteRating(0);
      setPurchaseRating(0);
    } catch {
      setReviewStatus(
        "Não foi possível registrar. Tente novamente mais tarde.",
      );
    }
  };
  const loadAdmin = async (token: string) => {
    setAdminLoading(true);
    try {
      setAdminStats(await fetchAdminStats(token));
      setAdminError("");
    } catch {
      setAdminError("Acesso negado ou erro ao carregar os dados.");
    } finally {
      setAdminLoading(false);
    }
  };
  const loginAdmin = async () => {
    try {
      const token = await signInAdmin(adminEmail, adminPassword);
      setAdminToken(token);
      setAdminPassword("");
      await loadAdmin(token);
    } catch {
      setAdminError("Não foi possível entrar. Confira o usuário e a senha.");
    }
  };

  const suppliers = useMemo(() => {
    const supplierMap = new Map<
      string,
      { name: string; brand: string; count: number }
    >();
    PRODUCTS.forEach((product) => {
      const name =
        product.supplierName?.trim() || product.brand?.trim() || "Outros";
      const key = normalize(name);
      const existing = supplierMap.get(key);
      if (existing) existing.count += 1;
      else
        supplierMap.set(key, { name, brand: product.brand || name, count: 1 });
    });
    return [...supplierMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );
  }, []);

  const brandOptions = useMemo(() => {
    const values = new Set<string>();
    PRODUCTS.forEach((product) => {
      if (product.brand?.trim()) values.add(product.brand.trim());
    });
    return [...values].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, []);

  const filteredProducts = useMemo(() => {
    // Remove os espaços do termo pesquisado e do filtro de marca selecionado
    const term = normalize(search).replace(/\s+/g, "");
    const brandFilterValue = brandFilter;
    const brandTerm = normalize(brandFilterValue).replace(/\s+/g, "");

    const result = PRODUCTS.filter((product) => {
      const matchesTerm =
        !term ||
        [
          product.name,
          product.id,
          product.brand,
          product.supplierName || "",
          product.barcode || "",
          product.supplierCode || "",
        ].some((value) =>
          normalize(String(value)).replace(/\s+/g, "").includes(term),
        );

      // Filtra pela marca comercial, sem misturar marcas do mesmo fornecedor.
      // Para opções que representam apenas fornecedores, mantém o filtro por fornecedor.
      const isBrandOption = brandOptions.some(
        (brand) => normalize(brand).replace(/\s+/g, "") === brandTerm,
      );
      const matchesBrand =
        brandFilterValue === "ALL" ||
        (isBrandOption
          ? normalize(product.brand).replace(/\s+/g, "") === brandTerm
          : normalize(product.supplierName || "").replace(/\s+/g, "") ===
            brandTerm);

      return matchesTerm && matchesBrand;
    });

    return result.sort((a, b) => {
      if (sortOrder === "code") {
        return String(a.id).localeCompare(String(b.id), "pt-BR", {
          numeric: true,
        });
      }

      if (sortOrder === "brand") {
        return a.brand.localeCompare(b.brand, "pt-BR", {
          sensitivity: "base",
        });
      }

      // Ordenação alfabética pelo nome do produto
      return a.name.trim().localeCompare(b.name.trim(), "pt-BR", {
        sensitivity: "base",
        ignorePunctuation: true,
      });
    });
  }, [search, brandFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage),
  );
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => setCurrentPage(1), [search, brandFilter, sortOrder]);

  const goToTab = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showBrandProducts = (brand: string) => {
    setSearch("");
    setBrandFilter(brand);
    goToTab("produtos");
  };

  const getLogo = (brand: string) => {
    const key = normalize(brand);
    const match = Object.entries(BRAND_LOGOS).find(
      ([name]) =>
        key.includes(normalize(name)) || normalize(name).includes(key),
    );
    return match ? match[1] : undefined;
  };

  return (
    <div className="site-shell">
      {showWelcome && (
        <div
          className={`speers-welcome ${welcomeLeaving ? "speers-welcome--leaving" : ""}`}
          role="status"
          aria-label="Bem-vindo à Speers Foods"
          aria-live="polite"
        >
          <div
            className="speers-welcome__glow speers-welcome__glow--one"
            aria-hidden="true"
          />
          <div
            className="speers-welcome__glow speers-welcome__glow--two"
            aria-hidden="true"
          />
          <div className="speers-welcome__content">
            <p className="speers-welcome__message">
              Bem-vindo à sua melhor escolha
            </p>
            <img
              className="speers-welcome__logo"
              src="/logo-speers.png"
              alt="Speers Foods"
            />
            <span className="speers-welcome__line" aria-hidden="true" />
          </div>
        </div>
      )}

      <header className="site-header">
        <div className="container header-inner">
          <button
            className="logo-button"
            aria-label="Ir para a página inicial"
            onClick={() => goToTab("speers")}
          >
            <img
              src="/logo-speers.png"
              alt="Speers Foods"
              className="site-logo"
            />
          </button>
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
          <nav
            className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`}
            aria-label="Menu principal"
          >
            {(Object.keys(tabLabels) as Tab[]).map((tab) => (
              <button
                key={tab}
                className={`nav-link ${activeTab === tab ? "is-active" : ""}`}
                onClick={() => goToTab(tab)}
              >
                {tabLabels[tab]}{" "}
                <i className="fa-solid fa-chevron-down nav-chevron" />
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="quote-cart-trigger"
              type="button"
              onClick={() => setCartOpen((prev) => !prev)}
              aria-label={`Abrir carrinho de orçamento: ${cartCount} unidades`}
              title="Meu carrinho"
            >
              <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
            </button>

            <button
              className="search-shortcut"
              aria-label="Pesquisar produtos"
              onClick={() => goToTab("produtos")}
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>

            <a
              className="instagram-header-button"
              href="https://www.instagram.com/speersfoods/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Speers Foods"
              title="Siga a Speers Foods no Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>

            <a
              className="header-phone-icon"
              href="tel:+551125237171"
              aria-label="Ligar para Speers Foods"
              title="Fale conosco"
            >
              <i className="fa-solid fa-phone" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <main>
        {activeTab === "speers" && (
          <>
            <section className="hero">
              <div className="hero-shape hero-shape-one" />
              <div className="hero-shape hero-shape-two" />
              <div className="container hero-layout">
                <div className="hero-speers-brand" aria-hidden="true">
                  <img
                    src="/logo-speers.png"
                    alt=""
                    className="hero-speers-logo"
                  />
                </div>

                <div className="hero-copy">
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Parceiros dos melhores
                    sabores
                  </span>
                  <h1>
                    Há mais de <span>20 anos</span> conectando você aos melhores
                    sabores.
                  </h1>
                  <p>
                    Importação, distribuição e comércio de alimentos congelados,
                    com foco em qualidade, parceria e soluções para o mercado
                    profissional.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="button button-outline"
                      onClick={() =>
                        document
                          .getElementById("marcas")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Conheça nossas marcas{" "}
                      <i className="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </div>

                <h2 className="brand-cards-title">
                  Alguns dos nossos sucessos
                </h2>
                <p className="brand-cards-subtitle">
                  Clique nos cards para conhecer mais sobre cada marca.
                </p>

                <div
                  className="brand-flip-grid"
                  aria-label="Conheça nossas marcas parceiras"
                >
                  <BrandFlipCard
                    name="Fazenda Futuro"
                    image="/fazenda-futuro-card.webp"
                    logo="/fazenda futuro.png"
                    description="A Fazenda Futuro é uma foodtech brasileira fundada em 2019, pioneira no desenvolvimento de alternativas como carne"
                  />
                  <BrandFlipCard
                    name="McCain"
                    image="/mccain-card.webp"
                    logo="/mccain-logo.png"
                    description="A McCain é referência mundial em batatas e alimentos congelados. Com mais de 65 anos de história, oferece produtos da melhor qualidade."
                  />
                  <BrandFlipCard
                    name="Frooty"
                    image="/frooty-card.webp"
                    logo="/frooty-logo.png"
                    description="Fundada em 1994, a Frooty é uma marca brasileira referência em açaí. Oferece produtos à base de frutas, como açaí e pitaya."
                  />
                  <BrandFlipCard
                    name="Franuí"
                    image="/card-franui.png"
                    logo="/franui-logo.png"
                    description="A Franuí é referência em sobremesas premium, combinando o frescor da fruta com a sofisticação do chocolate."
                  />
                  <BrandFlipCard
                    name="Grupo Bimbo"
                    image="/card-bimbo.png"
                    logo="/bimbo-logo.jpg"
                    description="O Grupo Bimbo é a maior empresa de panificação do mundo e referência em alimentos de qualidade."
                  />
                </div>
              </div>
            </section>

            {/* Nossos números — inspirado no layout de referência */}
            <section
              className="about-numbers"
              aria-labelledby="about-numbers-title"
            >
              <div className="container about-numbers-grid">
                <div className="about-numbers-copy">
                  <span className="section-kicker">Nossa trajetória</span>
                  <h2 id="about-numbers-title">
                    Mais de <span>20 anos</span> de história
                  </h2>
                  <p>
                    Somos referência na distribuição de alimentos congelados,
                    com uma trajetória construída com confiança, eficiência e
                    parceria. Reconhecida como a maior distribuidora da Zona
                    Leste de São Paulo, a Speers Foods atende diferentes
                    necessidades do mercado profissional.
                  </p>
                  <button
                    className="about-numbers-button"
                    onClick={() => goToTab("solucoes")}
                  >
                    <span aria-hidden="true">＋</span> CONHEÇA NOSSAS SOLUÇÕES
                  </button>
                </div>
                <div className="about-numbers-stats">
                  <div className="about-stat">
                    <span className="about-stat-icon">
                      <i className="fa-solid fa-calendar-check" />
                    </span>
                    <div>
                      <strong>+ de 20 anos</strong>
                      <span>De experiência no mercado</span>
                    </div>
                  </div>
                  <div className="about-stat">
                    <span className="about-stat-icon">
                      <i className="fa-solid fa-users" />
                    </span>
                    <div>
                      <strong>+ de 3.000 clientes</strong>
                      <span>Relacionamentos que fazem a diferença</span>
                    </div>
                  </div>
                  <div className="about-stat">
                    <span className="about-stat-icon">
                      <i className="fa-solid fa-truck-fast" />
                    </span>
                    <div>
                      <strong>São Paulo e Região</strong>
                      <span>Referência em distribuição de congelados</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Compromisso social e informação sobre inspeção */}
            <section
              className="community-section"
              aria-labelledby="community-title"
            >
              <div className="container">
                <div className="section-heading">
                  <span className="section-kicker">Nosso compromisso</span>
                  <h2 id="community-title">
                    Responsabilidade que vai além da distribuição
                  </h2>
                  <p>
                    Iniciativas e referências que fazem parte do universo da
                    alimentação.
                  </p>
                </div>
                <div className="community-grid">
                  <article className="community-card">
                    <div className="community-image">
                      <img
                        src="/mcdia-feliz-2026.png"
                        alt="Certificado de participação da Speers Foods no McDia Feliz 2026, emitido pela Casa Ronald McDonald Brasil"
                      />
                    </div>
                    <div className="community-card-content">
                      <span className="community-eyebrow">Solidariedade</span>
                      <h3>Speers Foods no McDia Feliz 2026</h3>
                      <p>
                        Participamos do McDia Feliz 2026, iniciativa que apoia
                        crianças e adolescentes com câncer e suas famílias. A
                        Casa Ronald McDonald Brasil reconheceu a contribuição da
                        Speers Foods para essa causa.
                      </p>
                    </div>
                  </article>
                  <article className="community-card">
                    <div className="community-image community-image-sif">
                      <img
                        src="/selo-s.i.f.png"
                        alt="Exemplo de selo do Serviço de Inspeção Federal (SIF), com número 3551"
                      />
                    </div>
                    <div className="community-card-content">
                      <span className="community-eyebrow">
                        Segurança dos alimentos
                      </span>
                      <h3>Inspeção e qualidade no setor</h3>
                      <p>
                        O Serviço de Inspeção Federal (SIF) identifica
                        estabelecimentos de produtos de origem animal sujeitos à
                        inspeção federal. O selo ilustrado é uma referência
                        visual; seu número não representa uma certificação da
                        Speers Foods.
                      </p>
                    </div>
                  </article>
                </div>
              </div>
            </section>

            <section className="brand-section" id="marcas">
              <div className="container">
                <div className="section-heading">
                  <span className="section-kicker">Nossas parcerias</span>
                  <h2>Marcas que fazem parte da nossa história</h2>
                  <p>Clique nos cards para ver os produtos de cada marca.</p>
                </div>
                <div className="featured-brands">
                  {FEATURED_BRANDS.map((brand) => (
                    <button
                      className="featured-brand"
                      key={brand.label}
                      onClick={() => showBrandProducts(brand.search)}
                      aria-label={`Ver produtos ${brand.label}`}
                    >
                      <img src={brand.logo} alt={brand.label} />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="intro-band">
              <div className="container intro-band-inner">
                <div>
                  <span className="section-kicker section-kicker-light">
                    Speers Foods
                  </span>
                  <h2>Conectando marcas, produtos e negócios.</h2>
                </div>
              </div>
            </section>
          </>
        )}
        {activeTab === "fornecedores" && (
          <section className="careers-page" aria-labelledby="careers-title">
            <div
              className="careers-visual"
              role="img"
              aria-label="Equipe unindo as mãos, representando união e trabalho em equipe"
            />
            <div className="careers-content">
              <span className="careers-kicker">Faça parte da nossa equipe</span>
              <h1 id="careers-title">
                Trabalhe <span>conosco</span>
              </h1>
              <p>
                Há mais de 20 anos, conectamos marcas e negócios por meio da
                distribuição de alimentos congelados. Buscamos pessoas
                comprometidas, que valorizem o trabalho em equipe e queiram
                crescer com a Speers Foods.
              </p>
              <a
                className="careers-cta"
                href="https://wa.me/5511989637374?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20sobre%20oportunidades%20de%20trabalho%20na%20Speers%20Foods."
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-whatsapp" /> FALE COM NOSSO RH{" "}
                <i className="fa-solid fa-arrow-up-right-from-square" />
              </a>
              <span className="careers-phone">
                Contato do RH: (11) 98963-7374
              </span>
            </div>
          </section>
        )}

        {activeTab === "produtos" && (
          <section className="page-section">
            <div className="container">
              <div className="page-heading">
                <span className="section-kicker">Encontre o que precisa</span>
                <h1>Catálogo de produtos</h1>
                <p>
                  Pesquise por nome, código, código de barras, marca ou
                  fornecedor.
                </p>
              </div>
              <div className="catalog-toolbar">
                <label className="search-field catalog-search">
                  <i className="fa-solid fa-magnifying-glass" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Ex.: batata, merluza, código do produto..."
                  />
                  {search && (
                    <button
                      aria-label="Limpar pesquisa"
                      onClick={() => setSearch("")}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  )}
                </label>
                <label className="filter-control">
                  <span>Marca</span>
                  <select
                    value={brandFilter}
                    onChange={(event) => setBrandFilter(event.target.value)}
                  >
                    <option value="ALL">Todas as marcas</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                    {suppliers
                      .filter(
                        (supplier) =>
                          !brandOptions.some(
                            (brand) =>
                              normalize(brand) === normalize(supplier.name),
                          ),
                      )
                      .map((supplier) => (
                        <option
                          key={`supplier-${supplier.name}`}
                          value={supplier.name}
                        >
                          {supplier.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="filter-control">
                  <span>Ordenar por</span>
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                  >
                    <option value="name">Nome (A–Z)</option>
                    <option value="code">Código</option>
                    <option value="brand">Marca</option>
                  </select>
                </label>
              </div>
              <div className="catalog-summary">
                <p>
                  <strong>{filteredProducts.length}</strong>{" "}
                  {filteredProducts.length === 1
                    ? "produto encontrado"
                    : "produtos encontrados"}
                </p>
                {(search || brandFilter !== "ALL") && (
                  <button
                    className="clear-filters"
                    onClick={() => {
                      setSearch("");
                      setBrandFilter("ALL");
                    }}
                  >
                    Limpar filtros <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {currentProducts.length > 0 ? (
                <div className="product-grid">
                  {currentProducts.map((product) => (
                    <article
                      className="product-card"
                      key={`${product.id}-${product.name}`}
                    >
                      <div className="product-card-art">
                        {product.image?.startsWith("/") ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-photo"
                            loading="lazy"
                          />
                        ) : (
                          <span className="product-art-icon">
                            <i className="fa-solid fa-box-open" />
                          </span>
                        )}

                        <span className="product-code">Cód. {product.id}</span>
                        <span className="product-unit">{product.unit}</span>
                      </div>
                      <div className="product-card-content">
                        <span className="product-brand">{product.brand}</span>
                        <h2>{product.name}</h2>
                        <p>
                          <i className="fa-solid fa-building" />{" "}
                          {product.supplierName || product.brand}
                        </p>
                        {product.barcode && (
                          <p className="product-barcode">
                            <i className="fa-solid fa-barcode" />{" "}
                            {product.barcode}
                          </p>
                        )}
                      </div>
                      <button
                        className="product-action"
                        type="button"
                        aria-label={`Adicionar ${product.name} ao carrinho de orçamento`}
                        onClick={() =>
                          setQuantity(product.id, (cart[product.id] || 0) + 1)
                        }
                      >
                        <i
                          className="fa-solid fa-cart-plus"
                          aria-hidden="true"
                        />
                        Adicionar ao carrinho{" "}
                        {cart[product.id] ? `(${cart[product.id]})` : ""}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fa-solid fa-box-open" />
                  <h2>Nenhum produto encontrado</h2>
                  <p>
                    Altere a pesquisa ou remova os filtros para ver mais
                    resultados.
                  </p>
                  <button
                    className="button button-green"
                    onClick={() => {
                      setSearch("");
                      setBrandFilter("ALL");
                    }}
                  >
                    Limpar pesquisa
                  </button>
                </div>
              )}

              {filteredProducts.length > 0 && (
                <div className="pagination">
                  <span>
                    Página <strong>{currentPage}</strong> de{" "}
                    <strong>{totalPages}</strong>
                  </span>
                  <div>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      <i className="fa-solid fa-arrow-left" /> Anterior
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      Próxima <i className="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "solucoes" && (
          <section className="page-section solutions-page">
            <div className="container solutions-container">
              <header className="solutions-hero">
                <span className="section-kicker">Atendimento sob medida</span>
                <h1>
                  Soluções para <span>o seu negócio</span>
                </h1>
                <p>
                  Conte o que você procura. Nossa equipe comercial ajuda a
                  encontrar as opções mais adequadas para sua necessidade.
                </p>
              </header>
              <div className="customer-form-layout">
                <div className="customer-form-intro">
                  <span className="section-kicker">Vamos conversar?</span>
                  <h2>O que podemos fazer por você?</h2>
                  <p>
                    Em poucos passos, você conta o que precisa e inicia uma
                    conversa diretamente com nossa equipe.
                  </p>
                  <div className="customer-steps">
                    <span>01 · Seu perfil</span>
                    <span>02 · Sua região</span>
                    <span>03 · Sua necessidade</span>
                  </div>
                </div>
                <form
                  className="customer-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendCustomerRequest();
                  }}
                >
                  <label htmlFor="customer-type">
                    Você compra para qual tipo de estabelecimento?
                  </label>
                  <select
                    id="customer-type"
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    required
                  >
                    {[
                      "Restaurante",
                      "Mercado ou minimercado",
                      "Padaria ou cafeteria",
                      "Cozinha industrial",
                      "Grande rede",
                      "Comércio de bairro",
                      "Uso pessoal",
                      "Outro estabelecimento",
                    ].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <label htmlFor="customer-region">
                    Qual é sua cidade ou bairro?
                  </label>
                  <input
                    id="customer-region"
                    value={customerRegion}
                    onChange={(e) => setCustomerRegion(e.target.value)}
                    placeholder="Ex.: São Paulo — Tatuapé"
                    maxLength={120}
                    required
                  />
                  <label htmlFor="customer-need">O que você precisa?</label>
                  <textarea
                    id="customer-need"
                    value={customerNeed}
                    onChange={(e) => setCustomerNeed(e.target.value)}
                    placeholder="Conte quais produtos, quantidades ou frequência de abastecimento procura."
                    maxLength={1200}
                    rows={5}
                    required
                  />
                  <button type="submit" className="button button-green">
                    <i className="fa-brands fa-whatsapp" aria-hidden="true" />{" "}
                    Solicitar atendimento
                  </button>
                  <small>
                    Você será direcionado ao WhatsApp. O atendimento e a
                    disponibilidade são confirmados pela equipe comercial.
                  </small>
                </form>
              </div>
            </div>
          </section>
        )}
      </main>

      {activeTab === "avaliacoes" && (
        <section
          className="page-section customer-review-section review-page"
          aria-labelledby="review-heading"
        >
          <div className="container review-page-container">
            <header className="review-page-hero">
              <span className="section-kicker">Sua voz faz a diferença</span>
              <h1 id="review-heading">
                Avalie-nos, sua opinião nos faz evoluir.
              </h1>
              <p>
                Na Speers Foods, cada experiência importa. Sua avaliação nos
                ajuda a identificar o que funciona bem, entender o que precisa
                melhorar e tornar sua jornada cada vez mais simples, segura e
                agradável.
              </p>
            </header>
            <div
              className="review-benefits"
              aria-label="Por que sua avaliação é importante"
            >
              <article>
                <h2>Queremos ouvir você</h2>
                <p>
                  Seu ponto de vista nos mostra como é navegar pelo site e
                  entrar em contato com nossa equipe.
                </p>
              </article>
              <article>
                <h2>Melhoria contínua</h2>
                <p>
                  Usamos as avaliações para orientar melhorias na experiência
                  digital e nos processos de atendimento.
                </p>
              </article>
              <article>
                <h2>Mais confiança e qualidade</h2>
                <p>
                  Nosso compromisso é evoluir para oferecer informações claras e
                  uma experiência de compra mais confortável.
                </p>
              </article>
            </div>
            <div className="review-form-card">
              <div className="review-form-intro">
                <span className="section-kicker">Leva menos de um minuto</span>
                <h2>Como foi sua experiência?</h2>
                <p>
                  Avalie de 1 a 5 estrelas. Suas respostas nos ajudam a definir
                  nossas próximas melhorias.
                </p>
              </div>
              <div className="review-controls">
                <div className="star-rating">
                  <span>Facilidade de uso do site</span>
                  <div role="group" aria-label="Nota de facilidade de uso">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setSiteRating(n)}
                        aria-label={`${n} estrela${n > 1 ? "s" : ""} para o site`}
                        aria-pressed={siteRating === n}
                        className={n <= siteRating ? "selected" : ""}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="star-rating">
                  <span>Você se sentiu confortável para comprar conosco?</span>
                  <div role="group" aria-label="Nota de confiança para comprar">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setPurchaseRating(n)}
                        aria-label={`${n} estrela${n > 1 ? "s" : ""} para confiança`}
                        aria-pressed={purchaseRating === n}
                        className={n <= purchaseRating ? "selected" : ""}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="review-submit"
                  type="button"
                  disabled={
                    !siteRating || !purchaseRating || !analyticsConfigured
                  }
                  onClick={() => void sendReview()}
                >
                  Enviar avaliação
                </button>
                <small role="status">
                  {reviewStatus ||
                    (!analyticsConfigured
                      ? "Para enviar avaliações, é necessário configurar o banco de dados."
                      : "Sua avaliação é anônima e não exige dados pessoais.")}
                </small>
              </div>
            </div>
            <p className="review-page-closing">
              Obrigado por fazer parte da nossa evolução. Cada estrela é uma
              oportunidade de melhorar para você.
            </p>
          </div>
        </section>
      )}
      <footer className="site-footer">
        <div className="container footer-main footer-main-expanded">
          <div className="footer-brand">
            <img src="/logo-speers.png" alt="Speers Foods" />
            <p>Distribuição de alimentos congelados e perecíveis.</p>
          </div>
          <div className="footer-nav">
            <span>Navegue</span>
            {(Object.keys(tabLabels) as Tab[]).map((tab) => (
              <button key={tab} onClick={() => goToTab(tab)}>
                {tabLabels[tab]}
              </button>
            ))}
          </div>
          <div className="footer-nav">
            <span>Conheça mais</span>
            <button onClick={() => goToTab("speers")}>Nossa história</button>
            <button onClick={() => goToTab("speers")}>Marcas parceiras</button>
            <button onClick={() => goToTab("produtos")}>
              Catálogo de produtos
            </button>
            <button onClick={() => goToTab("solucoes")}>
              Atendimento comercial
            </button>
            <button onClick={() => goToTab("fornecedores")}>
              Faça parte da equipe
            </button>
            <button onClick={() => goToTab("avaliacoes")}>
              Compartilhe sua avaliação
            </button>
          </div>
          <div className="footer-contact">
            <span>Contato e localização</span>
            <p>
              <i className="fa-solid fa-location-dot" aria-hidden="true" /> R.
              John Speers, 270 - Fazenda Caguaçu, São Paulo - SP, 08265-040
            </p>
            <p>
              <i className="fa-solid fa-phone" aria-hidden="true" />{" "}
              <a href="tel:+551125237171">(11) 2523-7171</a>
            </p>
            <p>
              <i className="fa-brands fa-whatsapp" aria-hidden="true" />{" "}
              <a
                href="https://wa.me/5511913682491"
                target="_blank"
                rel="noreferrer"
              >
                Atendimento pelo WhatsApp
              </a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <span>© {new Date().getFullYear()} Speers Foods</span>
            <button className="admin-link" onClick={() => setAdminOpen(true)}>
              Área administrativa
            </button>
          </div>
        </div>
      </footer>
      <QuoteCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onQuantityChange={setQuantity}
        onClear={() => setCart({})}
        onSubmit={submitQuote}
      />
      {adminOpen &&
        (adminToken ? (
          <AdminDashboard
            token={adminToken}
            stats={adminStats}
            error={adminError}
            loading={adminLoading}
            onRefresh={() => void loadAdmin(adminToken)}
            onClose={() => setAdminOpen(false)}
            onLogout={() => {
              setAdminToken("");
              setAdminStats(null);
              setAdminError("");
            }}
          />
        ) : (
          <div
            className="admin-overlay"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setAdminOpen(false);
            }}
          >
            <section
              className="admin-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Acesso administrativo"
            >
              <button
                className="admin-close"
                onClick={() => setAdminOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
              <h2>Área administrativa</h2>
              {!analyticsConfigured ? (
                <p>Configure o Supabase para ativar o painel.</p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void loginAdmin();
                  }}
                >
                  <label>
                    E-mail de administrador
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </label>
                  <label>
                    Senha
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </label>
                  <button type="submit" className="button button-green">
                    Entrar no painel
                  </button>
                </form>
              )}
              {adminError && <p role="alert">{adminError}</p>}
            </section>
          </div>
        ))}
    </div>
  );
}
