import { useEffect, useMemo, useState } from "react";
import { PRODUCTS, normalize } from "../config/catalog";

export function useSuccessSlides() {
  // Produtos reais das cinco marcas exibidos no centro da meia-lua.
  const successSlides = useMemo(() => {
    const brands = [
      "fazenda futuro",
      "mc cain",
      "mccain",
      "frooty",
      "franui",
      "bimbo",
    ];
    const seen = new Set<string>();
    return PRODUCTS.filter((product) => {
      const source = normalize(
        `${product.brand} ${product.supplierName || ""}`,
      );
      const image = product.image?.trim();
      if (
        !image ||
        image === "/logo-speers.png" ||
        !brands.some((brand) => source.includes(brand)) ||
        seen.has(image)
      )
        return false;
      seen.add(image);
      return true;
    }).map((product) => ({ image: product.image!, name: product.name }));
  }, []);
  const [successSlideIndex, setSuccessSlideIndex] = useState(0);
  useEffect(() => {
    if (successSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setSuccessSlideIndex((previous) => {
        const offset =
          1 + Math.floor(Math.random() * (successSlides.length - 1));
        return (previous + offset) % successSlides.length;
      });
    }, 1250);
    return () => window.clearInterval(timer);
  }, [successSlides]);
  return { successSlides, successSlideIndex };
}
