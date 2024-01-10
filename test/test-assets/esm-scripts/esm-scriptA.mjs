import { DESTROY, INITIALIZE, POST_INITIALIZE, POST_UPDATE, UPDATE, call } from '../../framework/components/esmscript/method-util.mjs';

export default class ScriptA {
    initialize() {
        call(INITIALIZE(this));
    }

    postInitialize() {
        call(POST_INITIALIZE(this));
    }

    update(dt) {
        call(UPDATE(this));
    }

    postUpdate(dt) {
        call(POST_UPDATE(this));
    }

    destroy() {
        call(DESTROY(this));
    }
}
