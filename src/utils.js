import sizes from './data/videoSizes.json';

export const withFrame = (src) => `${src}#t=0.1`;

export const ratioOf = (src) => {
  const cleanPath = src ? '/' + src.replace(/^.*\/media\//, 'media/') : '';
  const s = sizes[cleanPath] || sizes[src];
  return s ? s[0] / s[1] : 9 / 16;
};

export const isLandscape = (src) => ratioOf(src) > 1;
