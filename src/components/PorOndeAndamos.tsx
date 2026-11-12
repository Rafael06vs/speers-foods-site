import { useEffect, useMemo, useState } from "react";
import "../styles/sections/por-onde-andamos.css";

type Place = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  description: string;
  color: string;
};

const places: Place[] = [
  {
    id: "sp",
    name: "São Paulo",
    lat: -23.5505,
    lon: -46.6333,
    region: "Grande São Paulo",
    description: "Capital e região metropolitana · entregas ponto a ponto",
    color: "#ff9027",
  },
  {
    id: "guarulhos",
    name: "Guarulhos",
    lat: -23.4543,
    lon: -46.5337,
    region: "Grande São Paulo",
    description: "Atendimento na Grande São Paulo",
    color: "#ff9027",
  },
  {
    id: "osasco",
    name: "Osasco",
    lat: -23.5329,
    lon: -46.7917,
    region: "Grande São Paulo",
    description: "Atendimento na Grande São Paulo",
    color: "#ff9027",
  },
  {
    id: "abc",
    name: "ABC Paulista",
    lat: -23.6898,
    lon: -46.5646,
    region: "Grande São Paulo",
    description: "Atendimento à região do ABC Paulista",
    color: "#ff9027",
  },
  {
    id: "sjc",
    name: "São José dos Campos",
    lat: -23.1896,
    lon: -45.8841,
    region: "Vale do Paraíba",
    description: "Atendimento em todo o Vale do Paraíba",
    color: "#3598f4",
  },
  {
    id: "taubate",
    name: "Taubaté",
    lat: -23.0204,
    lon: -45.5564,
    region: "Vale do Paraíba",
    description: "Atendimento em todo o Vale do Paraíba",
    color: "#3598f4",
  },
  {
    id: "jacarei",
    name: "Jacareí",
    lat: -23.3053,
    lon: -45.9658,
    region: "Vale do Paraíba",
    description: "Atendimento em todo o Vale do Paraíba",
    color: "#3598f4",
  },
  {
    id: "pinda",
    name: "Pindamonhangaba",
    lat: -22.9246,
    lon: -45.4613,
    region: "Vale do Paraíba",
    description: "Atendimento em todo o Vale do Paraíba",
    color: "#3598f4",
  },
  {
    id: "guara",
    name: "Guaratinguetá",
    lat: -22.8166,
    lon: -45.1929,
    region: "Vale do Paraíba",
    description: "Atendimento em todo o Vale do Paraíba",
    color: "#3598f4",
  },
  {
    id: "lorena",
    name: "Lorena",
    lat: -22.7304,
    lon: -45.1245,
    region: "Vale do Paraíba",
    description: "Atendimento em todo o Vale do Paraíba",
    color: "#3598f4",
  },
  {
    id: "jundiai",
    name: "Jundiaí",
    lat: -23.1857,
    lon: -46.8978,
    region: "Jundiaí e entorno",
    description: "Distribuição na região de Jundiaí",
    color: "#27b77d",
  },
  {
    id: "campinas",
    name: "Campinas",
    lat: -22.9099,
    lon: -47.0626,
    region: "Jundiaí e entorno",
    description:
      "Ponto regional de referência; confirme cobertura com a equipe",
    color: "#27b77d",
  },
  {
    id: "sorocaba",
    name: "Sorocaba",
    lat: -23.5015,
    lon: -47.4526,
    region: "Sorocaba",
    description: "Entregas na região de Sorocaba",
    color: "#8b61df",
  },
  {
    id: "saoroque",
    name: "São Roque",
    lat: -23.5292,
    lon: -47.1357,
    region: "São Roque",
    description: "Entregas na região de São Roque",
    color: "#f1bc3c",
  },
  {
    id: "ribeirao",
    name: "Ribeirão Preto",
    lat: -21.1775,
    lon: -47.8103,
    region: "Ribeirão Preto",
    description: "Atendimento na região de Ribeirão Preto",
    color: "#ed6d9c",
  },
  {
    id: "caragua",
    name: "Caraguatatuba",
    lat: -23.6203,
    lon: -45.4131,
    region: "Litoral Norte",
    description: "Atendimento no Litoral Norte",
    color: "#16b7c9",
  },
  {
    id: "ubatuba",
    name: "Ubatuba",
    lat: -23.4332,
    lon: -45.0834,
    region: "Litoral Norte",
    description: "Atendimento no Litoral Norte",
    color: "#16b7c9",
  },
  {
    id: "santos",
    name: "Santos",
    lat: -23.9608,
    lon: -46.3336,
    region: "Litoral Sul",
    description: "Atendimento no litoral sul paulista",
    color: "#b0784f",
  },
  {
    id: "praia",
    name: "Praia Grande",
    lat: -24.0088,
    lon: -46.4126,
    region: "Litoral Sul",
    description: "Atendimento no litoral sul paulista",
    color: "#b0784f",
  },
];

// Códigos IBGE dos municípios de cada ponto. O "ABC Paulista" junta os
// sete municípios da região em uma única área.
const cityCodes: Record<string, string[]> = {
  sp: ["3550308"],
  guarulhos: ["3518800"],
  osasco: ["3534401"],
  abc: [
    "3547809", // Santo André
    "3548708", // São Bernardo do Campo
    "3548807", // São Caetano do Sul
    "3513801", // Diadema
    "3529401", // Mauá
    "3543303", // Ribeirão Pires
    "3544103", // Rio Grande da Serra
  ],
  sjc: ["3549904"],
  taubate: ["3554102"],
  jacarei: ["3524402"],
  pinda: ["3538006"],
  guara: ["3518404"],
  lorena: ["3527207"],
  jundiai: ["3525904"],
  campinas: ["3509502"],
  sorocaba: ["3552205"],
  saoroque: ["3550605"],
  ribeirao: ["3543402"],
  caragua: ["3510500"],
  ubatuba: ["3555406"],
  santos: ["3548500"],
  praia: ["3541000"],
};

const IBGE_MESH =
  "https://servicodados.ibge.gov.br/api/v3/malhas/municipios";

const STATE_GEOJSON =
  "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const bounds = {
  west: -53.12,
  east: -44.16,
  north: -19.77,
  south: -25.36,
};

const viewport = {
  x: 35,
  y: 20,
  w: 1130,
  h: 650,
};

// Enquadramento regional: calculado para conter todos os marcadores
// (de Ribeirão Preto ao litoral), no formato 2:1 do mapa.
const REGIONAL_VIEW = { x: 433, y: 129, w: 887, h: 444 };
const REGIONAL_VIEWBOX = `${REGIONAL_VIEW.x} ${REGIONAL_VIEW.y} ${REGIONAL_VIEW.w} ${REGIONAL_VIEW.h}`;
const FULL_VIEWBOX = "20 0 1180 700";

function project(lon: number, lat: number) {
  return {
    x:
      viewport.x +
      ((lon - bounds.west) / (bounds.east - bounds.west)) * viewport.w,
    y:
      viewport.y +
      ((bounds.north - lat) / (bounds.north - bounds.south)) * viewport.h,
  };
}

type Geometry = {
  type: string;
  coordinates: unknown;
};

type Feature = {
  type?: string;
  geometry?: Geometry;
  properties?: Record<string, unknown>;
};

type GeoData = Feature & {
  features?: Feature[];
};

type Polygon = number[][][];

function featuresOf(data: GeoData): Feature[] {
  if (data.type === "FeatureCollection") return data.features ?? [];
  if (data.type === "Feature") return [data];
  return [];
}

function polygonsOf(geo?: Geometry): Polygon[] {
  if (!geo) return [];

  if (geo.type === "Polygon") return [geo.coordinates as Polygon];
  if (geo.type === "MultiPolygon") return geo.coordinates as Polygon[];

  return [];
}

function polygonsToPath(polygons: Polygon[], digits: number): string {
  return polygons
    .flatMap((polygon) =>
      polygon.map(
        (ring) =>
          ring
            .map(([lon, lat], i) => {
              const p = project(lon, lat);

              return `${i ? "L" : "M"}${p.x.toFixed(digits)},${p.y.toFixed(
                digits,
              )}`;
            })
            .join(" ") + " Z",
      ),
    )
    .join(" ");
}

function ringContains(ring: number[][], lon: number, lat: number) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const crosses =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (crosses) inside = !inside;
  }

  return inside;
}

// Regra par-ímpar: o anel externo conta 1, buracos contam +1.
function polygonsContain(polygons: Polygon[], lon: number, lat: number) {
  return polygons.some(
    (polygon) =>
      polygon.filter((ring) => ringContains(ring, lon, lat)).length % 2 === 1,
  );
}

// Busca o contorno do(s) município(s) da cidade. Só aceita o resultado se o
// ponto da cidade estiver dentro dele; do contrário, usa o círculo reserva.
async function loadCityShape(place: Place): Promise<string> {
  const codes = cityCodes[place.id] ?? [];

  if (!codes.length) throw new Error("Sem código IBGE");

  const format = encodeURIComponent("application/vnd.geo+json");

  const responses = await Promise.all(
    codes.map(async (code) => {
      const res = await fetch(
        `${IBGE_MESH}/${code}?formato=${format}&qualidade=intermediaria`,
      );

      if (!res.ok) throw new Error(`IBGE ${code}`);

      return (await res.json()) as GeoData;
    }),
  );

  const polygons = responses
    .flatMap(featuresOf)
    .flatMap((feature) => polygonsOf(feature.geometry));

  if (!polygons.length || !polygonsContain(polygons, place.lon, place.lat)) {
    throw new Error(`Contorno inesperado para ${place.name}`);
  }

  return polygonsToPath(polygons, 1);
}

// Separa visualmente os marcadores muito próximos.
function spacedMarkers() {
  const pins = places.map((place) => ({
    id: place.id,
    ...project(place.lon, place.lat),
  }));

  const anchors = places.map((place) => project(place.lon, place.lat));

  const minimum = 30;

  for (let iteration = 0; iteration < 110; iteration++) {
    for (let i = 0; i < pins.length; i++) {
      for (let j = i + 1; j < pins.length; j++) {
        const dx = pins[j].x - pins[i].x;
        const dy = pins[j].y - pins[i].y;
        const distance = Math.hypot(dx, dy);

        if (distance >= minimum) continue;

        const angle = (i * 17 + j * 31) * 0.35;

        const ux = distance > 0.01 ? dx / distance : Math.cos(angle);

        const uy = distance > 0.01 ? dy / distance : Math.sin(angle);

        const move = (minimum - distance) * 0.32;

        pins[i].x -= ux * move;
        pins[i].y -= uy * move;

        pins[j].x += ux * move;
        pins[j].y += uy * move;
      }
    }

    pins.forEach((pin, i) => {
      pin.x += (anchors[i].x - pin.x) * 0.018;
      pin.y += (anchors[i].y - pin.y) * 0.018;
    });
  }

  return pins;
}

const markerPositions = spacedMarkers();

// Indica se o marcador aparece no enquadramento regional (com margem).
function isInRegionalView(id: string) {
  const pin = markerPositions.find((p) => p.id === id);

  if (!pin) return true;

  const margin = 14;

  return (
    pin.x >= REGIONAL_VIEW.x + margin &&
    pin.x <= REGIONAL_VIEW.x + REGIONAL_VIEW.w - margin &&
    pin.y >= REGIONAL_VIEW.y + margin &&
    pin.y <= REGIONAL_VIEW.y + REGIONAL_VIEW.h - margin
  );
}

const featuredIds = [
  "sp",
  "sjc",
  "jundiai",
  "sorocaba",
  "saoroque",
  "ribeirao",
  "caragua",
  "santos",
];

const routeIds = featuredIds.filter((id) => id !== "sp");

export default function PorOndeAndamos() {
  // "selected" é a cidade fixada pelo clique; "hovered" é só uma prévia
  // enquanto o mouse (ou o foco do teclado) está sobre a cidade.
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [fullMap, setFullMap] = useState(false);
  const [outline, setOutline] = useState("");
  const [mapError, setMapError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [shapes, setShapes] = useState<Record<string, string>>({});

  const shownId = hovered ?? selected;

  const active = useMemo(
    () => places.find((p) => p.id === shownId) ?? null,
    [shownId],
  );

  const hub = project(-46.6333, -23.5505);

  // Enquadramento regional por padrão; "Ver mapa completo" mostra o estado.
  const mapViewBox = fullMap ? FULL_VIEWBOX : REGIONAL_VIEWBOX;

  // Contorno do estado.
  useEffect(() => {
    let alive = true;

    fetch(STATE_GEOJSON)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Mapa indisponível");
        }

        return res.json();
      })
      .then((data: { features?: Feature[] }) => {
        const state = data.features?.find((f) =>
          Object.values(f.properties ?? {}).some(
            (value) =>
              typeof value === "string" &&
              /^(são paulo|sao paulo|sp)$/i.test(value.trim()),
          ),
        );

        if (!state) {
          throw new Error("São Paulo não encontrado");
        }

        if (alive) {
          setOutline(polygonsToPath(polygonsOf(state.geometry), 2));
          setMapError(false);
        }
      })
      .catch(() => {
        if (alive) setMapError(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Contornos dos municípios (carregados uma vez, para o destaque ser
  // instantâneo). Cidades que falharem usam o círculo reserva.
  useEffect(() => {
    let alive = true;

    places.forEach((place) => {
      loadCityShape(place)
        .then((d) => {
          if (alive) setShapes((prev) => ({ ...prev, [place.id]: d }));
        })
        .catch(() => {
          /* usa o círculo reserva */
        });
    });

    return () => {
      alive = false;
    };
  }, []);

  function choose(id: string) {
    setSelected(id);

    // Se a cidade está fora do enquadramento regional, abre o mapa completo
    // para o destaque não acontecer fora da tela.
    if (!fullMap && !isInRegionalView(id)) {
      setFullMap(true);
    }
  }

  function renderArea(place: Place, className: string, interactive: boolean) {
    const d = shapes[place.id];
    const anchor = project(place.lon, place.lat);

    const style = {
      fill: place.color,
      ...(className.includes("speers-route-city-on")
        ? { filter: `drop-shadow(0 0 9px ${place.color})` }
        : {}),
    };

    const handlers = interactive
      ? {
          onMouseEnter: () => setHovered(place.id),
          onMouseLeave: () => setHovered(null),
          onClick: () => choose(place.id),
        }
      : {};

    if (d) {
      return (
        <path
          key={`${className}-${place.id}`}
          className={className}
          d={d}
          style={style}
          {...handlers}
        >
          {interactive && <title>{place.name}</title>}
        </path>
      );
    }

    return (
      <circle
        key={`${className}-${place.id}`}
        className={className}
        cx={anchor.x}
        cy={anchor.y}
        r={place.id === "abc" ? 30 : 24}
        style={style}
        {...handlers}
      >
        {interactive && <title>{place.name}</title>}
      </circle>
    );
  }

  return (
    <section
      className="speers-route-page speers-route-tech"
      aria-label="Por Onde Andamos"
    >
      <header className="speers-route-intro">
        <span className="speers-route-eyebrow">
          Nossa presença em São Paulo
        </span>

        <h1>
          Por Onde <span>Andamos</span>
        </h1>

        <p>
          Explore nosso mapa animado e conheça as regiões de distribuição.
          Atendemos todo o Vale do Paraíba.
        </p>
      </header>

      
<div className="speers-route-toolbar">
  <div
    className="speers-route-places"
    aria-label="Selecionar cidades"
  >
    {(showAll
      ? places
      : places.filter((p) => featuredIds.includes(p.id))
    ).map((p) => (
      <button
        type="button"
        key={p.id}
        className={selected === p.id ? "is-active" : ""}
        onClick={() => choose(p.id)}
        onMouseEnter={() => setHovered(p.id)}
        onMouseLeave={() => setHovered(null)}
      >
        {p.name}
      </button>
    ))}

    <button
      type="button"
      className="speers-route-more"
      onClick={() => setShowAll((prev) => !prev)}
    >
      {showAll ? "− Menos cidades" : "+ Mais cidades"}
    </button>
  </div>

  <button
    type="button"
    className="speers-route-full-button"
    onClick={() => setFullMap((prev) => !prev)}
  >
    {fullMap
      ? "↩ Voltar ao mapa regional"
      : "↗ Ver mapa completo"}
  </button>
</div>


      <div className="speers-route-map-area">
        <div className="speers-route-map-wrap">
          <svg
            className="speers-route-map"
            viewBox={mapViewBox}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Mapa ilustrativo e interativo das regiões de distribuição de São Paulo"
          >
            <defs>
              <linearGradient id="speersLand" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#168c77" />
                <stop offset="50%" stopColor="#116c77" />
                <stop offset="100%" stopColor="#0b4265" />
              </linearGradient>

              <filter
                id="speersRelief"
                x="-30%"
                y="-30%"
                width="170%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="8"
                  stdDeviation="8"
                  floodColor="#00e5bd"
                  floodOpacity=".3"
                />
              </filter>

              <clipPath id="speersStateClip">
                <path d={outline} />
              </clipPath>

              <pattern
                id="speersTechGrid"
                width="35"
                height="35"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 35 0 L 0 0 0 35"
                  fill="none"
                  stroke="#6ee7d2"
                  strokeWidth=".7"
                  opacity=".16"
                />
              </pattern>
            </defs>

            {outline ? (
              <g className="speers-route-zoom-layer">
                <path
                  d={outline}
                  fill="#052c3d"
                  transform="translate(0 10)"
                  opacity=".5"
                />

                <path
                  d={outline}
                  fill="url(#speersLand)"
                  filter="url(#speersRelief)"
                />

                <g clipPath="url(#speersStateClip)">
                  <path d={outline} fill="url(#speersTechGrid)" />
                </g>

                {/* Áreas dos municípios: tom suave em repouso, cor cheia
                    na cidade em destaque (hover, foco ou clique). */}
                <g className="speers-route-cities">
                  {places.map((p) => renderArea(p, "speers-route-city", true))}

                  {active &&
                    renderArea(active, "speers-route-city-on", false)}
                </g>

                <path
                  d={outline}
                  fill="none"
                  stroke="#72f5ce"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />

                {places
                  .filter((p) => routeIds.includes(p.id))
                  .map((p) => {
                    const dest = project(p.lon, p.lat);

                    return (
                      <path
                        key={`route-${p.id}`}
                        className={`speers-route-line ${
                          active?.id === p.id ? "is-active" : ""
                        }`}
                        d={`M${hub.x},${hub.y} Q${(hub.x + dest.x) / 2},${
                          Math.min(hub.y, dest.y) - 45
                        } ${dest.x},${dest.y}`}
                      />
                    );
                  })}

                {places.map((p) => {
                  const anchor = project(p.lon, p.lat);

                  const xy =
                    markerPositions.find((pin) => pin.id === p.id) ?? anchor;

                  const displaced =
                    Math.hypot(xy.x - anchor.x, xy.y - anchor.y) > 9;

                  const isActive = shownId === p.id;

                  return (
                    <g
                      key={p.id}
                      transform={`translate(${xy.x},${xy.y})`}
                      role="button"
                      tabIndex={0}
                      className={`speers-route-pin ${
                        isActive ? "is-active" : ""
                      }`}
                      aria-label={`Ver ${p.name}`}
                      onClick={() => choose(p.id)}
                      onMouseEnter={() => setHovered(p.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(p.id)}
                      onBlur={() => setHovered(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          choose(p.id);
                        }
                      }}
                    >
                      {displaced && (
                        <line
                          x1={anchor.x - xy.x}
                          y1={anchor.y - xy.y}
                          x2="0"
                          y2="0"
                          stroke="#a6fff0"
                          strokeOpacity=".65"
                          strokeWidth="1.8"
                          strokeDasharray="3 3"
                        />
                      )}

                      <circle
                        r={isActive ? 21 : 16}
                        fill={isActive ? "#ff326d" : p.color}
                        opacity=".25"
                        className="speers-route-pin-halo"
                      />

                      <circle
                        r={isActive ? 11 : 9}
                        fill={isActive ? "#ff326d" : p.color}
                        stroke="white"
                        strokeWidth="3"
                      />

                      <circle r="2.5" fill="white" />

                      <title>{p.name}</title>
                    </g>
                  );
                })}
              </g>
            ) : (
              <text
                x={fullMap ? 600 : 870}
                y={fullMap ? 350 : 455}
                textAnchor="middle"
                fontSize="16"
                fill="#ffffff"
              >
                {mapError
                  ? "Não foi possível carregar o mapa."
                  : "Carregando mapa animado..."}
              </text>
            )}
          </svg>

          <div className="speers-route-map-foot">
            Áreas coloridas são ilustrativas (limites municipais do IBGE) e não
            garantem cobertura; confirme com nossa equipe. Marcadores próximos
            foram deslocados visualmente para facilitar a seleção; linhas finas
            indicam sua posição original. Não são rotas em tempo real.
          </div>
        </div>

        {/* CARD BRANCO ORIGINAL — PRESERVADO */}
        <aside className="speers-route-info" aria-live="polite">
          <span className="speers-route-info-tag">
            ✓ {active ? "Região selecionada" : "Distribuição em São Paulo"}
          </span>

          <div className="speers-route-info-icon"></div>

          <h2>{active?.name ?? "Explore nossas regiões"}</h2>

          <p>
            {active?.description ??
              "Passe o mouse ou clique em uma cidade no mapa, ou selecione uma abaixo, para destacar a área de atuação."}
          </p>

          {active && (
            <span
              className="speers-route-region-tag"
              style={{
                backgroundColor: active.color,
              }}
            >
              {active.region}
            </span>
          )}

          <div className="speers-route-info-rule" />

          <div className="speers-route-info-detail">
            <span>Distribuição de alimentos congelados</span>
          </div>

          <div className="speers-route-info-detail">
            <span>
              Consulte nossa equipe para confirmar o atendimento no endereço.
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
