'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;


/**
 * Возвращает новый emitter
 * @returns {Object}
 */
const getEmitter = () => {
    const root = {};
    const traverse = (event) => {
        const visited = [];
        event.split('.').reduce((acc, x) => {
            acc[x] = acc[x] || {};
            acc[x]['.'] = acc[x]['.'] || [];
            visited.push(acc[x]);

            return acc[x];
        }, root);

        return visited;
    };

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} emitter
         */
        on: function (event, context, handler) {
            const node = traverse(event).pop();
            node['.'].push([context, handler]);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} emitter
         */
        off: function (event, context) {
            const node = traverse(event).pop();
            for (let child of Object.keys(node).filter(x => x !== '.')) {
                delete node[child];
            }
            node['.'] = node['.'].filter(x => x[0] !== context);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} emitter
         */
        emit: function (event) {
            const nodes = traverse(event).reverse();
            nodes.forEach(n => n['.'].forEach(
                ([context, handler]) => handler.bind(context)()
            ));

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} emitter
         */
        several: function (event, context, handler, times) {
            function severalHandler() {
                if (times-- > 0) {
                    handler.bind(this)();
                }
            }
            this.on(event, context, severalHandler);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} emitter
         */
        through: function (event, context, handler, frequency) {
            let times = 0;
            function throughHandler() {
                if (!(times++ % frequency)) {
                    handler.bind(this)();
                }
            }
            this.on(event, context, throughHandler);

            return this;
        }
    };
};

module.exports = {
    getEmitter,
    isStar
};
