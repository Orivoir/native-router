export default  class Route {

  constructor( {
    el,
    url,
    title="",
    state={}
  } ) {

    this.el = el;
    this.url = url;
    this.title = title;
    this.state = state;
    this.isActive = false;

    this.id = `route-id-${Date.now() + (Math.random().toString().replace('.', '-'))}`;
    this.state.$details = {
      id: this.id,
      url: this.url,
      title: this.title
    };

    this.init();
  }

  init() {

    this.el.setAttribute('hidden', '');
  }

  get state() {
    return this._state;
  }
  set state(state) {
    this._state = (typeof state === "object" && !(state instanceof Array)) ?
      state:
      {}
    ;

  }

  enabled() {

    window.history.pushState(
      this.state,
      this.title,
      "#" + this.url
    );

  }

  disabled() {

    this.isActive = false;
  }

  destroy() {

    this.el.removeAttribute( 'data-route' );
    this.el.removeAttribute( 'data-route-default' );
    this.el.removeAttribute( 'hidden' );

    delete this.el;
    delete this.url;
    delete this.state;
    delete this.title;
    delete this.isActive;

    this.$isDelete = true;
  }

};
