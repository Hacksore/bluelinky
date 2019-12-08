import FormData from 'form-data';

export function buildFormData(config) {
  const form = new FormData();
  for (const key in config) {
    const value = config[key];
    if (typeof value !== 'object') {
      if (value !== undefined) {
        form.append(key, value.toString());
      }
    }
  }
  return form;
}
