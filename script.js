const urlUltimoResultado = 'https://loteriascaixa-api.herokuapp.com/api/mega-sena/latest';

const resultadoNumerosDiv = document.getElementById('resultadoNumeros');
const formTicket = document.getElementById('formTicket');
const numerosInput = document.getElementById('numerosInput');
const listaTickets = document.getElementById('listaTickets');
const msgErro = document.getElementById('msgErro');
const botaoSortear = document.getElementById('botaoSortear');
const resultadoSorteio = document.getElementById('resultadoSorteio');

let ultimoResultado = [];
let ticketsComprados = [];

// Função para formatar números com dois dígitos
function formatarNumero(num) {
  return num.toString().padStart(2, '0');
}

// Buscar o último resultado da Mega-sena
async function buscarUltimoResultado() {
  try {
    resultadoNumerosDiv.textContent = 'Carregando...';
    const res = await fetch(urlUltimoResultado);
    if (!res.ok) throw new Error('Erro na requisição');
    const data = await res.json();

    ultimoResultado = data.numeros.sort((a,b) => a-b);
    resultadoNumerosDiv.textContent = ultimoResultado.map(formatarNumero).join(' - ');
  } catch {
    resultadoNumerosDiv.textContent = 'Erro ao carregar resultado.';
  }
}

// Validar números do ticket
function validarNumeros(texto) {
  const nums = texto.split(',').map(n => parseInt(n.trim(), 10));
  if (nums.length !== 6) return { valido: false, msg: 'Informe exatamente 6 números.' };
  if (nums.some(n => isNaN(n) || n < 1 || n > 60)) return { valido: false, msg: 'Números devem estar entre 1 e 60.' };
  if (new Set(nums).size !== nums.length) return { valido: false, msg: 'Números duplicados não são permitidos.' };
  return { valido: true, numeros: nums.sort((a,b) => a-b) };
}

// Adicionar ticket comprado na lista
function adicionarTicket(numeros) {
  ticketsComprados.push(numeros);
  const li = document.createElement('li');
  li.textContent = numeros.map(formatarNumero).join(' - ');
  listaTickets.appendChild(li);
}

// Evento submit para comprar ticket
formTicket.addEventListener('submit', e => {
  e.preventDefault();
  msgErro.textContent = '';
  resultadoSorteio.textContent = '';

  const entrada = numerosInput.value;
  const validacao = validarNumeros(entrada);

  if (!validacao.valido) {
    msgErro.textContent = validacao.msg;
    return;
  }

  adicionarTicket(validacao.numeros);
  numerosInput.value = '';
  numerosInput.focus();
});

// Função para comparar dois arrays de números e contar acertos
function contarAcertos(arr1, arr2) {
  return arr1.filter(n => arr2.includes(n)).length;
}

// Função que simula o sorteio e verifica ganhadores
async function sortear() {
  if (ticketsComprados.length === 0) {
    resultadoSorteio.textContent = 'Compre pelo menos 1 ticket antes de sortear!';
    return;
  }

  resultadoSorteio.textContent = 'Sorteando...';

  // Simular timeout para suspense do sorteio (ex: 2 segundos)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Para este exemplo, vamos usar o último resultado como "sorteio"
  // Se quiser gerar números aleatórios, descomente a próxima linha e comente a atribuição:
  // const numerosSorteados = gerarNumerosAleatorios(6, 1, 60);

  const numerosSorteados = ultimoResultado;

  let ganhadores = [];

  ticketsComprados.forEach((ticket, i) => {
    const acertos = contarAcertos(ticket, numerosSorteados);
    if (acertos === 6) ganhadores.push(i);
  });

  if (ganhadores.length > 0) {
    resultadoSorteio.textContent = `🎉 Temos ${ganhadores.length} ganhador(es)! Parabéns! 🎉`;
  } else {
    resultadoSorteio.textContent = 'Nenhum ticket ganhou desta vez. Tente novamente!';
  }
}

// (Opcional) Função para gerar números aleatórios únicos no intervalo
function gerarNumerosAleatorios(qtd, min, max) {
  const nums = new Set();
  while (nums.size < qtd) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    nums.add(n);
  }
  return Array.from(nums).sort((a,b) => a-b);
}

// Evento do botão sortear
botaoSortear.addEventListener('click', () => {
  resultadoSorteio.textContent = '';
  sortear();
});

// Inicialização
buscarUltimoResultado();
