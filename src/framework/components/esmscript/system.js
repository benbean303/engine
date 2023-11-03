import { Debug } from '../../../core/debug.js';
import { ComponentSystem } from '../system.js';
import { EsmScriptComponent } from './component.js';
import { EsmScriptComponentData } from './data.js';
import { DynamicImport } from '../../handlers/esmscript.js';

/**
 * Allows scripts to be attached to an Entity and executed.
 *
 * @augments ComponentSystem
 */
class EsmScriptComponentSystem extends ComponentSystem {
    /**
     * Create a new ScriptComponentSystem.
     *
     * @param {import('../../app-base.js').AppBase} app - The application.
     * @hideconstructor
     */

    _components = new Set();

    constructor(app) {
        super(app);

        this.id = 'esmscript';

        this.ComponentType = EsmScriptComponent;
        this.DataType = EsmScriptComponentData;

        this.on('beforeremove', this._onBeforeRemove, this);
        this.app.systems.on('initialize', this._onInitialize, this);
        this.app.systems.on('postInitialize', this._onPostInitialize, this);
        this.app.systems.on('update', this._onUpdate, this);
        this.app.systems.on('postUpdate', this._onPostUpdate, this);
    }

    initializeComponentData(component, data) {

        this._components.add(component);

        component.enabled = data.hasOwnProperty('enabled') ? !!data.enabled : true;

        if (data.hasOwnProperty('modules')) {
            for (let i = 0; i < data.modules.length; i++) {
                const { moduleSpecifier, enabled, attributes } = data.modules[i];

                DynamicImport(this.app, moduleSpecifier).then(({ default: ModuleClass, attributes: attributeDefinition }) => {

                    component.create(moduleSpecifier, ModuleClass, attributeDefinition, attributes);

                }).catch(Debug.error);
            }
        }
    }

    cloneComponent(entity, clone) {
        const order = [];
        const scripts = { };

        for (let i = 0; i < entity.script._scripts.length; i++) {
            const scriptInstance = entity.script._scripts[i];
            const scriptName = scriptInstance.__scriptType.__name;
            order.push(scriptName);

            const attributes = { };
            for (const key in scriptInstance.__attributes)
                attributes[key] = scriptInstance.__attributes[key];

            scripts[scriptName] = {
                enabled: scriptInstance._enabled,
                attributes: attributes
            };
        }

        for (const key in entity.script._scriptsIndex) {
            if (key.awaiting) {
                order.splice(key.ind, 0, key);
            }
        }

        const data = {
            enabled: entity.script.enabled,
            order: order,
            scripts: scripts
        };

        return this.addComponent(clone, data);
    }

    _onInitialize() {
        this._components.forEach((component) => {
            if (component.enabled) component._onInitialize();
        });
    }

    _onPostInitialize() {
        this._components.forEach((component) => {
            if (component.enabled) component._onPostInitialize();
        });
    }

    _onUpdate(dt) {
        this._components.forEach((component) => {
            if (component.enabled) component._onUpdate(dt);
        });
    }

    _onPostUpdate(dt) {
        this._components.forEach((component) => {
            if (component.enabled) component._onPostUpdate();
        });
    }

    _onBeforeRemove(entity, component) {
        if (this._components.has(component)) {
            component._onBeforeRemove();
        }

        // remove from components array
        this._components.delete(component);
    }

    destroy() {
        super.destroy();

        this.app.systems.off('initialize', this._onInitialize, this);
        this.app.systems.off('postInitialize', this._onPostInitialize, this);
        this.app.systems.off('update', this._onUpdate, this);
        this.app.systems.off('postUpdate', this._onPostUpdate, this);
    }
}

export { EsmScriptComponentSystem };