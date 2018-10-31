'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;


function handleEvent(contexts) {
    for (let [obj, handlers] of contexts) {
        for (let handler of handlers) {
            execFunc(obj, handler);
        }
    }
}

function execFunc(obj, handler) {
    let shouldCall = true;
    if (handler.times !== 0 && handler.calls >= handler.times) {
        shouldCall = false;
    }

    if (handler.frequency !== 0 && handler.calls % handler.frequency !== 0) {
        shouldCall = false;
    }

    if (shouldCall) {
        handler.func.call(obj);
    }

    handler.calls++;
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const events = new Map();

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Object} additional
         * @returns {Object}
         */
        on: function (event, context, handler, additional = { times: 0, frequency: 0 }) {
            if (!events.has(event)) {
                events.set(event, new Map());
            }

            const contexts = events.get(event);

            if (!contexts.has(context)) {
                contexts.set(context, []);
            }

            contexts.get(context).push({
                func: handler,
                times: additional.times,
                frequency: additional.frequency,
                calls: 0
            });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            for (let eventName of events.keys()) {
                if (eventName === event || eventName.startsWith(event + '.')) {
                    events.get(eventName).delete(context);
                }
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            const allEvents = [];
            let prev = '';

            for (let part of event.split('.')) {
                if (prev !== '') {
                    prev += '.';
                }

                allEvents.push(prev += part);
            }

            for (let cuurEvent of allEvents.reverse()) {
                if (events.has(cuurEvent)) {
                    handleEvent(events.get(cuurEvent));
                }
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            this.on(event, context, handler, { times, frequency: 0 });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            this.on(event, context, handler, { times: 0, frequency });

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
