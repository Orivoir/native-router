const ce = new CustomEvent('native-router-error');

if( window.Router instanceof Function ) {

  ce.details = {
    message: "window.Router already exists"
  };

  document.dispatchEvent( ce );

  throw new Error(`oops, something went wrong Router have been already loaded`);
}

if( !window.history ) {

  ce.details = {
    message: "browser not support, History API is required",
    "@see": "https://developer.mozilla.org/en-US/docs/Web/API/History"
  };

  document.dispatchEvent( ce );

  console.warn(`
    History API is required for client native Router\n
    @see <https://developer.mozilla.org/en-US/docs/Web/API/History>
  `);

  throw new Error(`browser not support`);
}

import Route from './Route.js';
import Routes from './Routes.js';

/**
 * @class Router
 *
 *  all properties/methods start with char '$' should be considerate as private member
 */
class Router {

  constructor() {

    if( !document || !window ) {
      throw new Error('DOM should be loaded before instanciate Router');
    }

    this.bindinds(
      "onAddRoute",
      "onChangeRoute"
    );

    window.addEventListener('popstate', this.onChangeRoute );

    this.$routes = []; // Route[]
    this.$defaultRoute = null;

    this.$handlerRoutes = new Routes( this );

    const routesDom = document.querySelectorAll('*[data-route]');
    routesDom.forEach( this.onAddRoute );

    this.init();

    if( !this.$defaultRoute && routesDom.length > 0 ) {

      console.warn(
        `default route not define:
        should use "data-route-default" attribute
        on route considerate as default`
      );

    }
  }

  init() {

    // check if load document on specific route
    const initHash = this.hash;
    const initRoute = this.$handlerRoutes.$getByHash( initHash );

    if( initRoute instanceof Route ) {

      this.routes.enabled(
        initRoute,
        Routes.NOT_PUSH_HISTORY
      );

    } else if( this.$defaultRoute instanceof Route ) {

      this.routes.enabled(
        this.$defaultRoute,
        Route.PUSH_HISTORY
      );

    }

  }

  bindinds() {

    [...arguments].forEach( methodName => {

      this[ methodName ] = this[ methodName ].bind( this );

    } );

  }

  get query() {

    const usp = new URLSearchParams( window.location.search );

    const queryJson = {};

    for( const q of usp ) {

      queryJson[ q[0] ] = ( !isNaN(parseFloat( q[1] )) ? parseFloat( q[1] ): q[1] );
    }

    return queryJson;
  }

  returnTo( routeToReturnMatcher ) {

    const routeToReturn = this.$resolveRoute( routeToReturnMatcher );

    if( !(routeToReturn instanceof Route) ) {

      const path = this.query.return_to;
      const route = this.$handlerRoutes.$getByPath( path );

      if( !route ) {
        return false;
      } else {

        this.routes.disabled();
        this.routes.enabled(
          route,
          Routes.PUSH_HISTORY
        );

        // remove "return_to" search param
        const querystring = document.location.search;
        const usp = new URLSearchParams( querystring );

        usp.delete( "return_to" );

        this.setSearchParam( {
          route,
          usp
        } );

        return true;
      }

    } else {

      // push return_to search param
      const querystring = document.location.search || "";
      const usp = new URLSearchParams( querystring );
      usp.append( 'return_to', routeToReturn.url );

      this.setSearchParam( {
        route: this.routes.current,
        usp
      } );

    }

  }

  $resolveRoute( route ) {

    if( route instanceof Route ) {
      return route;
    }

    if( route instanceof HTMLElement ) {

      return this.$handlerRoutes.$getByEl( route );

    } else if( typeof route === 'string' ) {

      route = this.$handlerRoutes.$getByPath( route );

      if( route instanceof Route ) {
        return route;
      } else {

        route = this.$handlerRoutes.$getByHash( route );

        if( route instanceof Route ) {

          return route;
        } else {

          route = this.route.$getByid( route );

          if( route instanceof Route ) {

            return route;
          } else {

            return null;
          }
        }
      }
    } else {

      return null;
    }

  }

  setSearchParam( { route, usp } ) {

    if(
      !(usp instanceof URLSearchParams)
    ) {
      return false;
    }

    if( !(route instanceof Route) ) {
      route = this.$resolveRoute( route );
    }

    if( !(route instanceof Route) ) {
      return false;
    }

    const loc = new URL( document.location );

    loc.search = usp;

    window.history.replaceState(
      route.state,
      route.title,
      loc
    );

    return true;

  }

  get hash() {
    let {hash} = document.location;

    return hash;
  }

  onChangeRoute( event ) {

    const hash = this.hash;
    const route = this.$handlerRoutes.$getByHash( hash );

    if( !!route ) {

      const currentRouteDom = this.routes.current;

      const currentRoute = this.$handlerRoutes.$getByEl( currentRouteDom );

      if( route !== currentRoute ) {
        this.routes.disabled();
        this.routes.enabled(
          route,
          Routes.NOT_PUSH_HISTORY
        );
      }
    } else {

      // nav outside this client router
      this.$handlerRoutes.disabled();
    }

  }

  get state() {

    const routeDom = this.routes.current;

    if( routeDom ) {

      const route = this.$handlerRoutes.$getByEl( routeDom );

      return route.state;

    } else {

      return window.history.state;
    }
  }

  onAddRoute( options ) {

    if( options instanceof HTMLElement ) {

      options = {
        el: options,
        url: options.getAttribute('data-route'),
        title: "",
        state: {}
      };

    } else if( typeof options === "object" ) {

      options = {
        el: options.el,
        url: options.url,
        title: options.title,
        state: options.state
      };

    } else {

      throw new Error('addRoute arg1, options: HTMLElement | { el: HTMLElement, url: string, title: string, state?: {[keyname: string]: any} }');
    }

    const route = new Route( options );

    this.$routes.push( route );

    if( options.el.hasAttribute( 'data-route-default' ) ) {
      this.$defaultRoute = route;
    }

  }

  goAt( routeMatcher ) {

    const route = this.$resolveRoute( routeMatcher );

    const currentRouteDom = this.routes.current;
    const currentRoute = this.$handlerRoutes.$getByEl( currentRouteDom );

    if(
      route instanceof Route &&
      route.id !== currentRoute?.id
    ) {

      this.routes.disabled();

      this.routes.enabled(
        route,
        Routes.PUSH_HISTORY
      );

    }

  }

  get routes() {

    return this.$handlerRoutes;
  }

  destroy() {

    window.removeEventListener( 'popstate', this.onChangeRoute );

    this.routes.destroy();

    delete this.$routes;
    delete this.$handlerRoutes;

    this.$isDelete = true;
  }

};

window.Router = Router;
