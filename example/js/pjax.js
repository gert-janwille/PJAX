// TODO: PJAX Script
//        - When multiple popstate, then click item -> BROKEN

const Pjax = {
  wrapper: '.pjax-wrapper',
  container: '.pjax-container',

  verbose: 0,
  prefetch: false,
  enableCache: true,

  href: null,
  lastClickedElements: [],
  ignoreClassLink: 'no-prefetch',

  isAnimating: false,
  animations: {},
  cache: {},

  status: {
    nDone: false,
    oDone: false,
  },


  init(obj={}) {

    $.map(obj, (val, key) => this[key] = val);

    if (this.prefetch) this._prefetch();
    this.href = window.location.href;

    window.addEventListener('popstate', e => this._popAction(e));

    this._start();
  },

  _start() {
    $('a').off().click(e => {
      e.preventDefault();
      this._storeClickedElements(e.target);
      if (!this.isAnimating) this._trigger(e, e.target.href);
    });
  },

  animate(obj) {
    this.animations = obj;
  },

  _trigger(e, href) {
    if (!href) href = e.target;
    if (!href || this.href === href) return;

    history.pushState(null, null, href);
    this.href = href;

    this._loadContent(href)
      .then(data => this._replaceContent(data));
  },

  _loadContent(url) {
    if (this.cache[url]) return new Promise(resolve => resolve(this.cache[url]));

    this.verbose ? console.log(`Fetching ${url}`) : null;
    return this._cachePages(url);
  },

  _replaceContent(data) {
    const wrapper = $('<div></div>').append(data);
    const titleEl = wrapper.find('title');
    if (titleEl) document.title = titleEl[0].innerHTML;

    this.oldContainer = $(this.container);
    this.newContainer = wrapper.find(this.container);

    this._animate();
  },

  _animate() {
    this.isAnimating = true;

    // TODO: Checking for the best animations
    // this.newContainer.css({opacity: 0})
    // this.newContainer.css('visibility','hidden');
    // this.newContainer.css('display','none');

    // Start custom animations from main script
    if (this.animations.start) this.animations.start(this);

    $(this.wrapper).append(this.newContainer);

    $(this.oldContainer).promise().done(() => this._done('oDone'));
    $(this.newContainer).promise().done(() => this._done('nDone'));

    this._start();
  },

  _prefetch(prefetch) {
    this.prefetch = prefetch;

    // Get All links on main page
    if(this.verbose) console.log("Prefetching all pages...");
    const pageLinks = this._getLinks();

    // Crawl over all pages
    this._crawlPages(pageLinks);

  },

  _crawlPages(links) {
    links.map(url => {

      this._cachePages(url)
        .then(data => {

          const wrapper = $('<div></div>').append(data);
          const newLinks = this._getLinks(wrapper);

          if (!newLinks.length) return this.verbose ? console.log('All pages Fetched', this.cache) : null;
          newLinks.map(url => !this.cache[url] ? this._crawlPages(newLinks) : null)

        })
        .catch(e => console.error(e));
    });
  },

  _cachePages(url) {
    return fetch(url, {
      method: 'GET'
    })
    .then(r => this.enableCache ? this.cache[url] = r.text() : r.text())
    .catch(e => console.error(e));
  },

  _getLinks(data) {
    const _this = this;
    let links = [];

    if (data) return this._getLinksFromData(data);

    $('a').each(function() {
      if ($.inArray(this.href, links) === -1 && !this.classList.contains(_this.ignoreClassLink)) links.push(this.href);
    });

    return links
  },

  _getLinksFromData(data) {
    const _this = this;
    let links = [];

    data.find('a').each(function() {
      if ($.inArray(this.href, links) === -1 && !this.classList.contains(_this.ignoreClassLink)) links.push(this.href);
    });

    return links;
  },

  _storeClickedElements(el) {
    this.lastClickedElements.unshift(el.href);
    if (this.lastClickedElements.length > 3) this.lastClickedElements.pop();
  },

  _popAction(e) {
    const {href} = window.location;
    this.isAnimating = false;
    this._trigger(e, href);
  },

  _done(key) {
    this.status[key] = true;
    if (this.status.nDone && this.status.oDone) {
      $(this.oldContainer).remove();
      this.isAnimating = false;
      this.status = { nDone: false, oDone: false };
    }
  }
}
