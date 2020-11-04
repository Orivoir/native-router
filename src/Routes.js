/**
 * @class Routes
 *
 * handler for group ops Route[]
 */
export default class Routes {

  static get NOT_PUSH_HISTORY() {

    return false;
  }

  static get PUSH_HISTORY() {

    return true;
  }

  constructor( router ) {

    this.router = router;
  }

  add( {
    el,
    url,
    title,
    state
  } ) {

    this.router.onAddRoute( {
      el,
      url,
      title,
      state
    } );

  }

  get current() {

    return this.router.$routes.find( route => route.isActive )?.el;
  }

  disabled( route ) {

    if( !route ) {
      route = this.current;
    }

    if( route instanceof HTMLElement ) {

      route = this.$getByEl( route );
    }

    if( !route ) return;

    route.el.setAttribute('hidden','');

    route.disabled();
  }

  enabled( route, push=true ) {

    if( !route ) {
      throw new Error('arg1 route, should be instance of Route');
    }

    if( route instanceof HTMLElement ) {

      route = this.$getByEl( route );
    }

    if( route === this.current ) return;

    route.isActive = true;

    route.el.removeAttribute("hidden");

    if( push ) {
      route.enabled();
    }

  }

  destroy() {

    this.router.$routes.forEach(route => {
      route.destroy();
    });

    this.$isDelete = true;
  }

  $getByid( id ) {

    if( typeof id !== "string" ) return null;

    return this.router.$routes.find( route => route.id === id ) || null;
  }
  $getByEl( el ) {

    if( !(el instanceof HTMLElement) ) return null;

    return this.router.$routes.find( route => route.el === el ) || null;
  }
  $getByHash( hash ) {

    if( typeof hash !== "string" ) return null;

    return this.router.$routes.find( route => "#" + route.url === hash  ) || null;
  }
  $getByPath( path ) {

    if( typeof path !== "string" ) return null;

    return this.router.$routes.find( route => route.url === path  ) || null;
  }

}
