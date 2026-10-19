// Animação dos gráficos e dos números de destaque quando aparecem na tela: as barras crescem (CSS, em global.css)
// e os números sobem do zero até o valor. Só na primeira vez; depois, o que o simulador redesenha aparece direto.
// Com movimento reduzido, nada anima.

const DURACAO = 900;
const PASSO = 70; // atraso entre uma barra e a seguinte (--passo no CSS)
const ESCALONAMENTO = 700; // em listas longas (as 27 capitais), o passo encolhe para a última barra não demorar

const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Primeiro número do texto, no formato pt-BR: "R$ 1.476", "+38,5%", "R$ 4,99".
const NUMERO = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/;

const suave = (t: number) => 1 - (1 - t) ** 3;

/** Conta do zero até o número que já está no texto, mantendo o que vem antes e depois (R$, %, +). */
function contar(el: Element, atraso = 0) {
  const final = el.textContent ?? '';
  const m = NUMERO.exec(final);
  if (!m) return;
  const [antes, depois] = [final.slice(0, m.index), final.slice(m.index + m[0].length)];
  const casas = m[0].split(',')[1]?.length ?? 0;
  const alvo = Number(m[0].replace(/\./g, '').replace(',', '.'));
  // "2026" fica sem ponto; "1.476", com.
  const formato = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas, useGrouping: m[0].includes('.') });

  let escrito = final;
  const escrever = (texto: string) => {
    // O simulador trocou o texto no meio da contagem: o valor novo vale, e a contagem para.
    if (el.textContent !== escrito) return false;
    el.textContent = escrito = texto;
    return true;
  };
  escrever(antes + formato.format(0) + depois);

  const inicio = performance.now() + atraso;
  const quadro = (agora: number) => {
    const t = Math.min(1, Math.max(0, (agora - inicio) / DURACAO));
    if (!escrever(t === 1 ? final : antes + formato.format(alvo * suave(t)) + depois)) return;
    if (t < 1) requestAnimationFrame(quadro);
  };
  requestAnimationFrame(quadro);
}

function animarGrafico(area: HTMLElement) {
  const valores = [...area.querySelectorAll<SVGTextElement>('.grafico .valor')];
  const ordem = valores.map((v) => Number(v.style.getPropertyValue('--i')) || 0);
  const ultimo = Math.max(0, ...ordem);
  const passo = ultimo ? Math.min(PASSO, ESCALONAMENTO / ultimo) : 0;
  valores.forEach((v, k) => contar(v, ordem[k] * passo));
  area.style.setProperty('--passo', `${passo}ms`);
  area.dataset.anim = 'vai';
  setTimeout(() => (area.dataset.anim = 'feito'), ultimo * passo + DURACAO + 100);
}

const areas = [...document.querySelectorAll('.grafico')].map((g) => g.parentElement!);
const numeros = [...document.querySelectorAll('.hero__numero [class*="cp-value-"], .resultados [data-saida]')];

if (reduzido || !('IntersectionObserver' in window)) {
  areas.forEach((a) => (a.dataset.anim = 'feito'));
} else {
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        observador.unobserve(e.target);
        if (e.target instanceof HTMLElement && areas.includes(e.target)) animarGrafico(e.target);
        else contar(e.target);
      }
    },
    // Gráficos altos (as 27 capitais) nunca ficam inteiros na tela do celular: basta entrarem um pouco.
    { rootMargin: '0px 0px -15% 0px' },
  );
  [...areas, ...numeros].forEach((el) => observador.observe(el));
}
