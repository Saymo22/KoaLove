const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('Formulário de planos envia centavos e benefícios mesmo com o campo chamado id', async () => {
  let submit, sent, price = '19,90';
  const button = {disabled: false};
  const form = {
    id: {value: ''}, // Um input name=id oculta a propriedade nativa form.id.
    elements: {id: {value: ''}},
    getAttribute: key => key === 'id' ? 'planForm' : null,
    addEventListener: (event, handler) => { if (event === 'submit') submit = handler; },
    querySelector: () => button,
    querySelectorAll: () => [{name: 'active', checked: true}, {name: 'featured', checked: false}],
    reset() {},
  };
  const status = {textContent: ''};
  const list = {replaceChildren() {}, append() {}};
  const scope = vm.createContext({
    protegerRotaAdmin: async () => true, renderAdminHeader() {},
    formatarPreco: value => String(value), Date, Option: function () {},
    FormData: class {
      constructor() {
        return [['id', 'plan-test'], ['price', price], ['name', 'Presente completo'], ['features', 'Fotos\n\nLink e QR Code'],
          ['photos_limit', '12'], ['videos_limit', '4'], ['music_limit', '1'], ['sort_order', '0']];
      }
    },
    ApiClient: {
      get: async () => ({plans: [], promotions: [], coupons: []}),
      post: async (path, data) => { sent = {path, data}; },
    },
    document: {
      getElementById: id => id === 'pricingStatus' ? status : list,
      createElement: () => ({textContent: ''}),
      querySelectorAll: selector => selector === '.pricing-form' ? [form] : [],
    },
  });
  vm.runInContext(fs.readFileSync('resources/js/admin/planos.js', 'utf8'), scope);
  await new Promise(resolve => setImmediate(resolve));
  for (const [input, expected] of [['19,90', 1990], ['20.5', 2050], ['100', 10000]]) {
    price = input;
    await submit({preventDefault() {}});
    assert.equal(sent.path, '/admin/plans/plan-test');
    assert.equal(sent.data.price_cents, expected);
    assert.deepEqual(Array.from(sent.data.features), ['Fotos', 'Link e QR Code']);
    assert.equal(sent.data.active, true);
    assert.equal(button.disabled, false);
  }
  price = '19,999'; sent = null;
  await submit({preventDefault() {}});
  assert.equal(sent, null);
  assert.match(status.textContent, /19,90/);
});
