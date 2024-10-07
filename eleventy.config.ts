import { DateTime } from 'luxon';

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/index.css');
  eleventyConfig.addPassthroughCopy('src/assets');

  return {
    dir: {
      input: './src',
      includes: './layouts',
    },
  };
}
