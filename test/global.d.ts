// aqui declaro o escopo global
// e instancio o testRequest
// para ele ser usado e alterado em outro metodo

declare global {
  // declarando no escopo global
  // linhas abaixo é para o eslint ignorar a var ali
  // eslint-disable-next-line
  var testRequest: import("supertest").SuperTest<import("supertest").Test>;
  // declarando a existencia do
  // testRequest no escopo global
  // como o tipo test do supertest
}

export {};
