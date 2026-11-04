import { useState, type FormEvent } from "react";
import type { QuoteInput } from "../../analytics.ts";

export type CartItem = { id: string; name: string; brand: string; unit: string; image?: string; quantity: number };
type Props = { open: boolean; onClose: () => void; items: CartItem[]; onQuantityChange: (id: string, quantity: number) => void; onClear: () => void; onSubmit: (quote: QuoteInput) => Promise<string> };
const WHATSAPP = "5511913682491";
export default function QuoteCart({ open, onClose, items, onQuantityChange, onClear, onSubmit }: Props) {
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  if (!open) return null;
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!items.length || sending) return;
    setSending(true); setError("");
    const quote: QuoteInput = { company: company.trim(), contact: contact.trim(), phone: phone.trim(), notes: notes.trim(), items: items.map(({ id, name, brand, unit, quantity }) => ({ id, name, brand, unit, quantity })) };
    // Abre uma aba imediatamente para evitar bloqueio de pop-up após a chamada assíncrona.
    const whatsappTab = window.open("about:blank", "_blank");
    try {
      const reference = await onSubmit(quote);
      const message = ["Olá! Gostaria de solicitar um orçamento à Speers Foods.", `Referência: ${reference}`, `Empresa: ${quote.company}`, `Contato: ${quote.contact}`, `Telefone: ${quote.phone}`, "", "PRODUTOS:", ...quote.items.map((item, index) => `${index + 1}. ${item.name} | Cód. ${item.id} | ${item.quantity} ${item.unit}`), "", `Observações: ${quote.notes || "Nenhuma"}`, "", "Por favor, confirmem valores, disponibilidade e condições comerciais."].join("\n");
      const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
      if (whatsappTab) whatsappTab.location.href = url;
      else window.location.href = url;
      // O carrinho permanece salvo até o cliente removê-lo, inclusive se fechar o WhatsApp.
    } catch (e) {
      if (whatsappTab) whatsappTab.close();
      setError(e instanceof Error ? e.message : "Não foi possível registrar a cotação. Tente novamente.");
    } finally { setSending(false); }
  };
  return <div className="quote-cart-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <aside className="quote-cart-panel" role="dialog" aria-modal="true" aria-label="Carrinho de orçamento">
      <header className="quote-cart-head"><div><span>Speers Foods</span><h2>Meu carrinho de orçamento</h2><p>{items.length} produtos · {total} unidades</p></div><button type="button" onClick={onClose} aria-label="Fechar carrinho">✕</button></header>
      <div className="quote-cart-scroll">
        {!items.length ? <div className="quote-cart-empty"><i className="fa-solid fa-cart-shopping" /><h3>Seu carrinho está vazio</h3><p>Adicione produtos do catálogo para solicitar um orçamento.</p><button type="button" onClick={onClose}>Continuar escolhendo</button></div> : <>
          <div className="quote-cart-list">{items.map(item => <article className="quote-cart-item" key={item.id}>
            <div className="quote-cart-thumb">{item.image?.startsWith("/") ? <img src={item.image} alt="" /> : <i className="fa-solid fa-box" />}</div>
            <div className="quote-cart-detail"><strong>{item.name}</strong><small>Cód. {item.id} · {item.unit} · {item.brand}</small><div className="quote-cart-qty"><button type="button" onClick={() => onQuantityChange(item.id, item.quantity - 1)} aria-label={`Diminuir ${item.name}`}>−</button><span>{item.quantity}</span><button type="button" onClick={() => onQuantityChange(item.id, item.quantity + 1)} aria-label={`Aumentar ${item.name}`}>+</button><button type="button" className="quote-cart-remove" onClick={() => onQuantityChange(item.id, 0)}>Remover</button></div></div>
          </article>)}</div>
          <button type="button" className="quote-cart-clear" onClick={onClear}>Limpar carrinho</button>
          <form className="quote-cart-form" onSubmit={send}>
            <h3>Dados para orçamento</h3>
            <label>Empresa / estabelecimento <input required maxLength={120} value={company} onChange={e => setCompany(e.target.value)} placeholder="Nome da empresa" /></label>
            <label>Seu nome <input required maxLength={100} value={contact} onChange={e => setContact(e.target.value)} placeholder="Responsável pela cotação" /></label>
            <label>Telefone / WhatsApp <input required type="tel" maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" /></label>
            <label>Observações (opcional) <textarea maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Prazo, região de entrega, dúvidas..." rows={3} /></label>
            {error && <p role="alert" className="quote-cart-error">{error}</p>}
            <p className="quote-cart-note">Os produtos ficam somente no seu carrinho até você clicar em Enviar orçamento. Nesse momento, a solicitação será registrada para a equipe comercial e o WhatsApp abrirá com a mensagem pronta. Você ainda precisará enviá-la no WhatsApp.</p>
            <button type="submit" className="quote-cart-send" disabled={sending}>{sending ? "Registrando cotação..." : "Enviar orçamento para o time de vendas"} <i className="fa-brands fa-whatsapp" /></button>
          </form>
        </>}
      </div>
    </aside>
  </div>;
}
