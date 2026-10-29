import { useEffect, useMemo, useState } from "react";
import productsData from "./data/products.json";

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

type Tab = "speers" | "fornecedores" | "produtos" | "qualidade";

const PRODUCTS = (productsData as Product[]).filter((product) => product.available !== false);

const BRAND_LOGOS: Record<string, string> = {
  "forno de minas": "/forno-de-minas-logo.jpg",
  mccain: "/mccain-logo.png",
  "franui": "/franui-logo.png",
  "franuí": "/franui-logo.png",
  minerva: "/minerva-foods-logo.jpg",
  "minerva s/a": "/minerva-foods-logo.jpg",
  "bmg foods": "/bmg foods.png",
  "bimbo": "/bimbo-logo.jpg",
  "grano": "/grano foods.jpg",
  "golden": "/golden imex.png",
  "bimbo do brasil": "/bimbo-logo.jpg",
  "lar cooperativa": "/lar cooperativa agroindustrial.png",
  "grupo bimbo": "/bimbo-logo.jpg",
  frooty: "/frooty-logo.png",
  "fazenda futuro": "/fazenda futuro.png",
};

const FEATURED_BRANDS = [
  { label: "Forno de Minas", logo: "/forno-de-minas-logo.jpg", search: "forno de minas" },
  { label: "bmg Foods", logo: "/bmg foods.png", search: "bmg foods" },
  { label: "Grano Foods", logo: "/grano foods.jpg", search: "grano" },
  { label: "Lar Cooperativa", logo: "/lar cooperativa agroindustrial.png", search: "lar cooperativa" },
  { label: "Golden Imex", logo: "/golden imex.png", search: "golden" },
  { label: "McCain", logo: "/mccain-logo.png", search: "mccain" },
  { label: "Franui", logo: "/franui-logo.png", search: "franui" },
  { label: "Minerva", logo: "/minerva-foods-logo.jpg", search: "minerva" },
  { label: "Bimbo", logo: "/bimbo-logo.jpg", search: "bimbo" },
  { label: "Frooty", logo: "/frooty-logo.png", search: "frooty" },
  { label: "Fazenda Futuro", logo: "/fazenda futuro.png", search: "fazenda futuro" },
];

const normalize = (value = "") =>
  value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const tabLabels: Record<Tab, string> = {
  speers: "A Speers",
  fornecedores: "Fornecedores",
  produtos: "Produtos",
  qualidade: "Qualidade",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("speers");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsPerPage = 24;

  const suppliers = useMemo(() => {
    const supplierMap = new Map<string, { name: string; brand: string; count: number }>();
    PRODUCTS.forEach((product) => {
      const name = product.supplierName?.trim() || product.brand?.trim() || "Outros";
      const key = normalize(name);
      const existing = supplierMap.get(key);
      if (existing) existing.count += 1;
      else supplierMap.set(key, { name, brand: product.brand || name, count: 1 });
    });
    return [...supplierMap.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
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
      const matchesTerm = !term || [
        product.name,
        product.id,
        product.brand,
        product.supplierName || "",
        product.barcode || "",
        product.supplierCode || "",
      ].some((value) => normalize(String(value)).replace(/\s+/g, "").includes(term));

      // Se o filtro for o valor padrão "ALL", exibe tudo
      // Caso contrário, removemos os espaços de ambos os lados da comparação para bater certinho
      const matchesBrand =
        brandFilterValue === "ALL" ||
        normalize(product.brand).replace(/\s+/g, "").includes(brandTerm) ||
        normalize(product.supplierName).replace(/\s+/g, "").includes(brandTerm) ||
        normalize(product.name).replace(/\s+/g, "").includes(brandTerm);

      return matchesTerm && matchesBrand;
    });

    return result.sort((a, b) => {
      if (sortOrder === "code") return String(a.id).localeCompare(String(b.id), "pt-BR", { numeric: true });
      if (sortOrder === "brand") return a.brand.localeCompare(b.brand, "pt-BR");
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [search, brandFilter, sortOrder]);


  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    const match = Object.entries(BRAND_LOGOS).find(([name]) => key.includes(normalize(name)) || normalize(name).includes(key));
    return match ? match[1] : undefined;
  };

  return (
    <div className="site-shell">
      <div className="topbar">
        <div className="container topbar-inner">
          <p className="topbar-tag"><span className="topbar-mark">✳</span> Distribuição de alimentos congelados e perecíveis</p>
          <div className="topbar-benefits">
            <span><i className="fa-solid fa-truck-fast" /> Logística eficiente</span>
            <span><i className="fa-solid fa-shield-halved" /> Qualidade e segurança</span>
            <span><i className="fa-solid fa-handshake" /> Parcerias de longo prazo</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <button className="logo-button" aria-label="Ir para a página inicial" onClick={() => goToTab("speers")}>
            <img src="/speers-logo.png" alt="Speers Foods" className="site-logo" />
          </button>
          <button
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>
          <nav className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Menu principal">
            {(Object.keys(tabLabels) as Tab[]).map((tab) => (
              <button key={tab} className={`nav-link ${activeTab === tab ? "is-active" : ""}`} onClick={() => goToTab(tab)}>
                {tabLabels[tab]} <i className="fa-solid fa-chevron-down nav-chevron" />
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button className="search-shortcut" aria-label="Pesquisar produtos" onClick={() => goToTab("produtos")}>
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            <button className="button button-green header-quote" onClick={() => goToTab("produtos")}>
              Explorar catálogo <i className="fa-solid fa-arrow-right" />
            </button>
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
                <div className="hero-copy">
                  <span className="eyebrow"><span className="eyebrow-dot" /> Parceiros dos melhores sabores</span>
                  <h1>Há mais de <span>20 anos</span> conectando você aos melhores sabores.</h1>
                  <p>Importação, distribuição e comércio de alimentos congelados, com foco em qualidade, parceria e soluções para o mercado profissional.</p>
                  <div className="hero-actions">
                    <button className="button button-outline" onClick={() => document.getElementById("marcas")?.scrollIntoView({ behavior: "smooth" })}>
                      Conheça nossas marcas <i className="fa-solid fa-arrow-right" />
                    </button>
                    <button className="button button-orange" onClick={() => goToTab("produtos")}>Ver catálogo</button>
                  </div>
                  <div className="hero-note"><i className="fa-solid fa-snowflake" /> Um portfólio pensado para diferentes necessidades do mercado.</div>
                </div>
                <div className="hero-visual">
                  <img src="/docas.webp" alt="Seleção de alimentos congelados e ingredientes" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                  <div className="visual-caption">
                    <span className="caption-icon"><i className="fa-solid fa-boxes-stacked" /></span>
                    <div><strong>Variedade para o seu negócio</strong><span>Conheça as marcas do nosso catálogo</span></div>
                  </div>
                  <div className="visual-decoration">SPEERS<br /><span>FOODS</span></div>
                </div>
              </div>
            </section>

            <section className="brand-section" id="marcas">
              <div className="container">
                <div className="section-heading">
                  <span className="section-kicker">Nossas parcerias</span>
                  <h2>Marcas que fazem parte da nossa história</h2>
                  <p>Explore as marcas presentes no catálogo da Speers Foods.</p>
                </div>
              </div>
            </section>

            <section className="intro-band">
              <div className="container intro-band-inner">
                <div><span className="section-kicker section-kicker-light">Speers Foods</span><h2>Conectando marcas, produtos e negócios.</h2></div>
                <p>Conheça nosso catálogo e encontre produtos por nome, código ou marca.</p>
              </div>
            </section>
          </>
        )}

        {activeTab === "fornecedores" && (
          <section className="page-section">
            <div className="container">
              <div className="page-heading">
                <span className="section-kicker">Nossas parcerias</span>
                <h1>Fornecedores</h1>
                <p>Conheça as marcas e empresas identificadas no catálogo atual.</p>
              </div>
              <label className="search-field supplier-search">
                <i className="fa-solid fa-magnifying-glass" />
                <input value={supplierSearch} onChange={(event) => setSupplierSearch(event.target.value)} placeholder="Buscar fornecedor pelo nome..." />
                {supplierSearch && <button aria-label="Limpar busca" onClick={() => setSupplierSearch("")}><i className="fa-solid fa-xmark" /></button>}
              </label>
              <div className="supplier-grid">
                {suppliers.filter((supplier) => normalize(supplier.name).includes(normalize(supplierSearch))).map((supplier) => {
                  const logo = getLogo(supplier.brand) || getLogo(supplier.name);
                  return (
                    <article className="supplier-card" key={supplier.name}>
                      <div className="supplier-card-top">
                        <div className="supplier-logo">
                          {logo ? (
                            <img 
                              src={logo} 
                              alt={`Logo ${supplier.name}`} 
                              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
                            />
                          ) : (
                            <span>{supplier.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="item-count">{supplier.count} {supplier.count === 1 ? "produto" : "produtos"}</span>
                      </div>
                      <h2>{supplier.name}</h2>
                      <p>Marca ou fornecedor identificado nos registros do catálogo de produtos.</p>
                      <button className="text-link" onClick={() => showBrandProducts(supplier.brand)}>Ver produtos <i className="fa-solid fa-arrow-right" /></button>
                    </article>
                  );
                })}
                {suppliers.filter((supplier) => normalize(supplier.name).includes(normalize(supplierSearch))).length === 0 && (
                  <div className="empty-state"><i className="fa-solid fa-magnifying-glass" /><h2>Nenhum fornecedor encontrado</h2><p>Tente outro nome ou termo de busca.</p></div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "produtos" && (
          <section className="page-section">
            <div className="container">
              <div className="page-heading">
                <span className="section-kicker">Encontre o que precisa</span>
                <h1>Catálogo de produtos</h1>
                <p>Pesquise por nome, código, código de barras, marca ou fornecedor.</p>
              </div>
              <div className="catalog-toolbar">
                <label className="search-field catalog-search">
                  <i className="fa-solid fa-magnifying-glass" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex.: batata, merluza, código do produto..." />
                  {search && <button aria-label="Limpar pesquisa" onClick={() => setSearch("")}><i className="fa-solid fa-xmark" /></button>}
                </label>
                <label className="filter-control">
                  <span>Marca</span>
                  <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
                    <option value="ALL">Todas as marcas</option>
                    {brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                    {suppliers.filter((supplier) => !brandOptions.some((brand) => normalize(brand) === normalize(supplier.name))).map((supplier) => (
                      <option key={`supplier-${supplier.name}`} value={supplier.name}>{supplier.name}</option>
                    ))}
                  </select>
                </label>
                <label className="filter-control">
                  <span>Ordenar por</span>
                  <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                    <option value="name">Nome (A–Z)</option>
                    <option value="code">Código</option>
                    <option value="brand">Marca</option>
                  </select>
                </label>
              </div>
              <div className="catalog-summary">
                <p><strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}</p>
                {(search || brandFilter !== "ALL") && <button className="clear-filters" onClick={() => { setSearch(""); setBrandFilter("ALL"); }}>Limpar filtros <i className="fa-solid fa-xmark" /></button>}
              </div>

              {currentProducts.length > 0 ? (
                <div className="product-grid">
                  {currentProducts.map((product) => (
                    <article className="product-card" key={`${product.id}-${product.name}`}>
                      <div className="product-card-art">
                        <span className="product-art-icon"><i className="fa-solid fa-box-open" /></span>
                        <span className="product-code">Cód. {product.id}</span>
                        <span className="product-unit">{product.unit}</span>
                      </div>
                      <div className="product-card-content">
                        <span className="product-brand">{product.brand}</span>
                        <h2>{product.name}</h2>
                        <p><i className="fa-solid fa-building" /> {product.supplierName || product.brand}</p>
                        {product.barcode && <p className="product-barcode"><i className="fa-solid fa-barcode" /> {product.barcode}</p>}
                      </div>
                      <button className="product-action" onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent(`Consulta de produto ${product.id}`)}&body=${encodeURIComponent(`Olá, gostaria de consultar disponibilidade e condições para o produto:\n${product.name}\nCódigo: ${product.id}\nMarca: ${product.brand}`)}`}>
                        Consultar produto <i className="fa-solid fa-arrow-right" />
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><i className="fa-solid fa-box-open" /><h2>Nenhum produto encontrado</h2><p>Altere a pesquisa ou remova os filtros para ver mais resultados.</p><button className="button button-green" onClick={() => { setSearch(""); setBrandFilter("ALL"); }}>Limpar pesquisa</button></div>
              )}

              {filteredProducts.length > 0 && <div className="pagination">
                <span>Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
                <div><button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}><i className="fa-solid fa-arrow-left" /> Anterior</button><button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>Próxima <i className="fa-solid fa-arrow-right" /></button></div>
              </div>}
            </div>
          </section>
        )}

        {activeTab === "qualidade" && (
          <section className="page-section quality-page">
            <div className="container">
              <div className="page-heading">
                <span className="section-kicker">Compromisso no relacionamento</span>
                <h1>Qualidade construída em parceria</h1>
                <p>Há mais de 20 anos, a Speers Foods conecta clientes a marcas e produtos para o mercado de alimentos.</p>
              </div>
              <div className="quality-intro">
                <div className="quality-intro-icon"><i className="fa-solid fa-handshake-angle" /></div>
                <div><h2>Relacionamentos de longo prazo</h2><p>Nosso trabalho aproxima clientes, fornecedores e marcas, com atenção à escolha dos produtos e às necessidades de cada operação.</p></div>
              </div>
              <div className="quality-brand-grid">
          <article className="quality-brand-card"><div><img src="/franui-logo.png" alt="Franui" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Franui</h2><p>Conheça os produtos da marca disponíveis no catálogo da Speers Foods.</p><button className="text-link" onClick={() => showBrandProducts("franui")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/mccain-logo.png" alt="McCain" /></div><span className="quality-label">Marca presente no catálogo</span><h2>McCain</h2><p>Explore os produtos McCain cadastrados no catálogo.</p><button className="text-link" onClick={() => showBrandProducts("mccain")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/golden imex.png" alt="Golden Imex" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Golden Imex</h2><p>Descubra os produtos Golden Imex disponíveis no catálogo.</p><button className="text-link" onClick={() => showBrandProducts("golden")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/grano foods.jpg" alt="Grano Foods" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Grano Foods</h2><p>Confira os itens da marca Grano Foods no catálogo.</p><button className="text-link" onClick={() => showBrandProducts("grano")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/lar cooperativa agroindustrial.png" alt="Lar Cooperativa" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Lar Cooperativa</h2><p>Explore os produtos Lar Cooperativa cadastrados no catálogo.</p><button className="text-link" onClick={() => showBrandProducts("lar cooperativa")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/minerva-foods-logo.jpg" alt="Minerva" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Minerva</h2><p>Consulte os itens relacionados à marca no catálogo atual.</p><button className="text-link" onClick={() => showBrandProducts("minerva")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/bimbo-logo.jpg" alt="Bimbo" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Bimbo</h2><p>Descubra os produtos Bimbo disponíveis no catálogo da Speers Foods.</p><button className="text-link" onClick={() => showBrandProducts("bimbo")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/bmg foods.png" alt="bmg Foods" /></div><span className="quality-label">Marca presente no catálogo</span><h2>bmg Foods</h2><p>Confira os produtos da marca bmg Foods cadastrados no catálogo.</p><button className="text-link" onClick={() => showBrandProducts("bmg foods")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/frooty-logo.png" alt="Frooty" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Frooty</h2><p>Explore os produtos Frooty disponíveis no catálogo da Speers Foods.</p><button className="text-link" onClick={() => showBrandProducts("frooty")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/fazenda futuro.png" alt="Fazenda Futuro" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Fazenda Futuro</h2><p>Conheça os produtos da marca Fazenda Futuro disponíveis no catálogo.</p><button className="text-link" onClick={() => showBrandProducts("fazenda futuro")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
                <article className="quality-brand-card"><div><img src="/forno-de-minas-logo.jpg" alt="Forno de Minas" /></div><span className="quality-label">Marca presente no catálogo</span><h2>Forno de Minas</h2><p>Descubra os produtos da marca Forno de Minas cadastrados no catálogo.</p><button className="text-link" onClick={() => showBrandProducts("forno de minas")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></article>
              </div>
              <div className="quality-note"><i className="fa-solid fa-circle-info" /><p>As informações desta página apresentam o relacionamento comercial e as marcas do catálogo. Não são declaradas certificações ou garantias técnicas não confirmadas.</p></div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand"><img src="/speers-logo.png" alt="Speers Foods" /><p>Distribuição de alimentos congelados e perecíveis.</p></div>
          <div className="footer-nav"><span>Explore</span>{(Object.keys(tabLabels) as Tab[]).map((tab) => <button key={tab} onClick={() => goToTab(tab)}>{tabLabels[tab]}</button>)}</div>
          <div className="footer-contact"><span>Catálogo</span><p>Consulte os produtos por nome, código ou marca.</p><button className="button button-orange" onClick={() => goToTab("produtos")}>Ver produtos <i className="fa-solid fa-arrow-right" /></button></div>
        </div>
        <div className="footer-bottom"><div className="container"><span>© {new Date().getFullYear()} Speers Foods</span><span>Conteúdo institucional e catálogo de produtos.</span></div></div>
      </footer>
    </div>
  );
}
