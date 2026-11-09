import productsData from "../../data/products.json";

export type Product = {
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

export type Tab = "speers" | "fornecedores" | "produtos" | "solucoes" | "avaliacoes";

export const PRODUCTS = (productsData as Product[]).filter(
  (product) => product.available !== false,
);

export const BRAND_LOGOS: Record<string, string> = {
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

export const FEATURED_BRANDS = [
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
    search: "MC CAIN DO BRASIL ALIMENTOS LTDA",
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

export const normalize = (value = "") =>
  value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const tabLabels: Record<Tab, string> = {
  speers: "Quem somos",
  fornecedores: "Trabalhe conosco",
  produtos: "Produtos",
  solucoes: "Soluções para seu negócio",
  avaliacoes: "Avalie-nos",
};

