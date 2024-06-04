import { toLower, upperFirst } from 'lodash';

const descriptorMapping = (data: { key: string; value: string }[]) => {
  const desc = data.map((_) => {
    return `${upperFirst(toLower(_.key))}:${upperFirst(toLower(_.value))}`;
  });
  return desc;
};

export default descriptorMapping;
