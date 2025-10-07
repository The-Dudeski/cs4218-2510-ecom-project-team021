import userModel from '../models/userModel.js';

describe('userModel schema', () => {
  it('has required string fields: name, email, password, phone, answer', () => {
    const { paths } = userModel.schema;
    expect(paths.name.instance).toBe('String');
    expect(paths.name.options.required).toBe(true);
    expect(paths.email.instance).toBe('String');
    expect(paths.email.options.required).toBe(true);
    expect(paths.password.instance).toBe('String');
    expect(paths.password.options.required).toBe(true);
    expect(paths.phone.instance).toBe('String');
    expect(paths.phone.options.required).toBe(true);
    expect(paths.answer.instance).toBe('String');
    expect(paths.answer.options.required).toBe(true);
  });

  it('has address required and role default 0', () => {
    const { paths } = userModel.schema;
    expect(paths.address.options.required).toBe(true);
    expect(paths.role.instance).toBe('Number');
    expect(paths.role.options.default).toBe(0);
  });

  it('sets unique index on email', () => {
    const { paths } = userModel.schema;
    expect(paths.email.options.unique).toBe(true);
  });

  it('enables timestamps', () => {
    const opts = userModel.schema.options;
    expect(opts.timestamps).toBe(true);
  });
});


