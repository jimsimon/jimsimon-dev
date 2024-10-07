import { DateTime } from 'luxon';

export default {
  layout: 'post.html',
  tags: ['post'],
  eleventyComputed: {
    dateString: ({ page }) => DateTime.fromJSDate(page.date, { zone: 'UTC' }).toLocaleString(DateTime.DATE_FULL),
  },
};
