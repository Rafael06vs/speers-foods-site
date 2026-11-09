import type { AdminStats } from "../../analytics";

type Props = {
  stats: AdminStats | null;
  error: string;
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
  onLogout: () => void;
};

const format = (n: number) => new Intl.NumberFormat("pt-BR").format(n);
const rating = (n: number | null) => n == null ? "—" : Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export default function AdminDashboard({ stats, error, loading, onRefresh, onClose, onLogout }: Props) {
  const cards = stats ? [
    { label: "Visitas registradas", value: stats.visits, symbol: "◉", hint: "Carregamentos do site" },
    { label: "Sessões distintas", value: stats.unique_sessions, symbol: "♧", hint: "Sessões de navegação" },
    { label: "Cliques em orçamento", value: stats.quote_clicks, symbol: "↗", hint: "Intenção de contato" },
    { label: "Avaliações recebidas", value: stats.review_count, symbol: "★", hint: "Opiniões registradas" },
  ] : [];
  const max = Math.max(1, ...cards.map(c => c.value));
  const scores = stats ? [
    { label: "Facilidade de uso do site", value: stats.site_avg },
    { label: "Confiança para comprar", value: stats.purchase_avg },
  ] : [];
  return (
    <main className="management-dashboard" role="dialog" aria-modal="true" aria-label="Painel gerencial Speers Foods">
      <aside className="management-sidebar">
        <div className="management-brand"><span className="management-brand-icon">S</span><span><strong>SPEERS FOODS</strong><small>Business Intelligence</small></span></div>
        <div className="management-sidebar-label">GERENCIAMENTO</div>
        <div className="management-nav-active">▦ &nbsp; Visão geral</div>
        <div className="management-sidebar-bottom"><span className="management-status-dot" /> Supabase conectado</div>
      </aside>
      <div className="management-content">
        <header className="management-topbar"><div><span className="management-eyebrow">PAINEL ADMINISTRATIVO</span><h1>Visão geral da operação digital</h1><p>Indicadores de desempenho do site Speers Foods</p></div><div className="management-actions"><button type="button" onClick={onRefresh} disabled={loading} className="management-refresh">{loading ? "Atualizando..." : "↻ Atualizar dados"}</button><button type="button" onClick={onLogout} className="management-ghost">Sair da conta</button><button type="button" onClick={onClose} className="management-close" aria-label="Fechar painel">✕</button></div></header>
        {error && <div className="management-error" role="alert">{error}</div>}
        {!stats ? <div className="management-empty">{loading ? "Carregando indicadores..." : "Não foi possível carregar os indicadores. Clique em Atualizar dados."}</div> : <>
          <section className="management-kpis" aria-label="Indicadores principais">{cards.map(card => <article className="management-kpi" key={card.label}><div className="management-kpi-top"><span>{card.label}</span><span className="management-kpi-symbol">{card.symbol}</span></div><strong>{format(card.value)}</strong><small>{card.hint}</small></article>)}</section>
          <div className="management-panels"><section className="management-card management-chart"><div className="management-card-heading"><div><span className="management-eyebrow">ENGAJAMENTO</span><h2>Atividade do site</h2></div><span className="management-pill">Total acumulado</span></div><div className="management-bar-chart" role="img" aria-label="Comparação dos totais de visitas, sessões, orçamentos e avaliações">{cards.map(card => <div className="management-bar-item" key={card.label}><div className="management-bar-value">{format(card.value)}</div><div className="management-bar-track"><div className="management-bar-fill" style={{height:`${Math.max(card.value ? 5 : 0, card.value / max * 100)}%`}} /></div><span>{card.label.replace(" registradas", "").replace(" distintas", "").replace("Cliques em ", "").replace(" recebidas", "")}</span></div>)}</div><p className="management-note">Comparação entre indicadores de naturezas diferentes; não representa evolução no tempo.</p></section>
          <section className="management-card management-ratings"><div className="management-card-heading"><div><span className="management-eyebrow">SATISFAÇÃO</span><h2>Experiência dos clientes</h2></div><span className="management-pill">Escala 1–5</span></div>{scores.map(score => <div className="management-rating-row" key={score.label}><div className="management-rating-title"><span>{score.label}</span><strong>{rating(score.value)} <small>/ 5</small></strong></div><div className="management-rating-track"><div style={{width:`${Math.max(0,Math.min(100,(Number(score.value)||0)*20))}%`}} /></div><span className="management-stars" aria-label={`${rating(score.value)} de 5 estrelas`}>★★★★★</span></div>)}<div className="management-rating-footer"><strong>{format(stats.review_count)}</strong><span>avaliações recebidas desde o início da coleta</span></div></section></div>
          <section className="management-bottom"><div><strong>Como interpretar os dados</strong><p>As visitas representam eventos registrados, não pessoas únicas. Sessões distintas não equivalem necessariamente a visitantes únicos. Cliques em orçamento não significam vendas concluídas.</p></div><div className="management-data-label">Fonte: Supabase · Dados acumulados</div></section>
        </>}
      </div>
    </main>
  );
}
