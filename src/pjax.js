/**
 * pjax.js
 * This object is a function who can be used to change content
 * without a full page refresh. Initialize the Pjax Library and
 * the wrapped content will be changed.
 * Use the animate function to animate the old and new container.
 *
 * @version 1.0
 * @author  Gert-Jan Wille, https://github.com/gert-janwille/
 * @updated 2018-03-07
 *
 */

const Pjax = {
  // Set default wrapper class.
  wrapper: '.pjax-wrapper',
  // Set default container class.
  container: '.pjax-container',
  // Set default no prefetch class.
  ignorePrefetchClass: '.no-prefetch',
  // Set default ignore a tag link class.
  ignoreLinkClass: '.no-link',


  // Set default false to give output (caching, fetching pages).
  verbose: 0,
  // Set default false to prefetch pages.
  prefetch: false,
  // Set default true to cache fetched pages.
  enableCache: true,

  // Url of the current page.
  href: null,
  // Array with latest clicked elements.
  lastClickedElements: [],

  // If the elements are animating or done.
  isAnimating: false,
  // Object with all animations described in the main file.
  animations: {},
  // Object with cached pages.
  cache: {},

  // Status of the old and new container.
  status: {
    nDone: false,
    oDone: false,
  },

  init(obj={}) {
    // Map the object and save values.
    $.map(obj, (val, key) => this[key] = val);
    // Save current link.
    this.href = window.location.href;

    // If user go back.
    window.addEventListener('popstate', e => this._popAction(e));
    // Start the main script.
    this._start();
  },

  _start() {
    // Prefetch all pages if needed.
    if (this.prefetch) this._prefetch();

    // Find all a tags.
    $('a').off().click(e => {
      // If no-link ignore and continue.
      if (e.target.classList.contains(this.ignoreLinkClass.split('.').join(""))) return;

      // else start replace and animate.
      e.preventDefault();
      // Save the 3 latest clicks.
      this._storeClickedElements(e.target);
      // if no animation start trigger.
      if (!this.isAnimating) this._trigger(e, e.target.href);
    });
  },

  animate(obj) {
    // Custom animations done in the main script.
    this.animations = obj;
  },

  _trigger(e, href) {
    // Validate the href/url.
    if (!href) href = e.target;
    if (!href || this.href === href) return;

    // Change the url in the browser url bar.
    history.pushState(null, null, href);
    // Save the clicked url.
    this.href = href;

    // Start fetching the new content and replace.
    this._loadContent(href)
      .then(data => this._replaceContent(data));
  },

  _loadContent(url) {
    // If page is in cache use this.
    if (this.cache[url]) return new Promise(resolve => resolve(this.cache[url]));

    // else fetch the page & cache if needed.
    this.verbose ? console.log(`Fetching ${url}`) : null;
    return this._cachePages(url);
  },

  _replaceContent(data) {
    // Save the new data in a wrapper.
    const wrapper = $('<div></div>').append(data);

    // Find and replace the page title.
    const titleEl = wrapper.find('title');
    if (titleEl) document.title = titleEl[0].innerHTML;

    // Find and save the new and old content.
    this.oldContainer = $(this.container);
    this.newContainer = wrapper.find(this.container);

    // Start the animation.
    this._animate();
  },

  _animate() {
    // Tell the script the animation has started.
    this.isAnimating = true;

    // Start custom animations from main script.
    if (this.animations.start) this.animations.start(this);

    // Append the new data to the wrapper.
    $(this.wrapper).append(this.newContainer);

    // Set container status true if animation on container is done.
    $(this.oldContainer).promise().done(() => this._done('oDone'));
    $(this.newContainer).promise().done(() => this._done('nDone'));

    // Trigger a new start for getting the links.
    this._start();
  },

  _prefetch: function(prefetch) {
    // If cache is disabled don't do a prefetch.
    if (!this.enableCache) return;
    // Prefetch only once, set null or false.
    this.prefetch = null;

    // Get All links on main page.
    if(this.verbose) console.log("Prefetching all pages...");
    const pageLinks = this._getLinks();

    // Crawl over all pages.
    this._crawlPages(pageLinks);
  },

  _crawlPages(links) {
    // Map over all page links.
    links.map(url => {
      // Fetch and cache the page.
      this._cachePages(url)
        .then(data => {
          // Append new data to a container.
          const wrapper = $('<div></div>').append(data);
          // Get all links from new data who's not in cache.
          const newLinks = this._getLinks(wrapper);

          // If all pages are cached stop prefetch.
          if (!newLinks.length) return this.verbose ? console.log('All pages Fetched', this.cache) : null;
          // else map, fetch and cache again.
          newLinks.map(url => !this.cache[url] ? this._crawlPages(newLinks) : null)
        })
        // If there is an error log it.
        .catch(e => console.error('Crawl Error', e));
    });
  },

  _cachePages(url) {
    // Fetch page
    return fetch(url, {
      method: 'GET'
    })
    // If cache is enabled cache the page and return data else only return the data.
    .then(r => this.enableCache ? this.cache[url] = r.text() : r.text())
    // If there is an error log it.
    .catch(e => console.error('Fetch Error', e));
  },

  _getLinks(data) {
    const _this = this;
    let links = [];
    // If there is data fetch links from data.
    if (data) return this._getLinksFromData(data);
    // else get al a tags from main page, check if they don't have a ignore class and push in array.
    $('a').each(function() {
      if ($.inArray(this.href, links) === -1 && !this.classList.contains(_this.ignorePrefetchClass)) links.push(this.href);
    });
    // Return the array with the links.
    return links
  },

  _getLinksFromData(data) {
    const _this = this;
    let links = [];
    // Find all a tags in data, check if they don't have a ignore class and push in array.
    data.find('a').each(function() {
      if ($.inArray(this.href, links) === -1 && !this.classList.contains(_this.ignorePrefetchClass)) links.push(this.href);
    });
    // Return the array with the links.
    return links;
  },

  _storeClickedElements(el) {
    // Add last clicked element to the array.
    this.lastClickedElements.unshift(el.href);
    // if the array has more then 3 items remove the first added one.
    if (this.lastClickedElements.length > 3) this.lastClickedElements.pop();
  },

  _popAction(e) {
    // Get url from the browser url bar.
    const {href} = window.location;
    // Set animation false.
    this.isAnimating = false;
    // Trigger the fetch and animation.
    this._trigger(e, href);
  },

  _done(key) {
    // Set status from containers done.
    this.status[key] = true;

    // If both containers are done animating do something.
    if (this.status.nDone && this.status.oDone) {

      // Remove the old container from the DOM.
      $(this.oldContainer).remove();
      // Tell the script the animation has ended.
      this.isAnimating = false;
      // Set the status back to false.
      this.status = { nDone: false, oDone: false };
    }
  }
}
