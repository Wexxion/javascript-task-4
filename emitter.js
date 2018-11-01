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
    const { func, times, frequency, funcCallsCount } = handler;

    let shouldCall = true;
    if (times !== 0 && funcCallsCount >= times) {
        shouldCall = false;
    }

    if (frequency !== 0 && funcCallsCount % frequency !== 0) {
        shouldCall = false;
    }

    if (shouldCall) {
        func.call(obj);
    }

    handler.funcCallsCount++;
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
            let contexts = events.get(event);
            if (!contexts) {
                contexts = new Map();
                events.set(event, contexts);
            }

            let handlers = contexts.get(context);
            if (!handlers) {
                handlers = [];
                contexts.set(context, handlers);
            }

            handlers.push({
                func: handler,
                times: additional.times,
                frequency: additional.frequency,
                funcCallsCount: 0
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
                prev += part;
                allEvents.push(prev);
            }

            for (let currentEvent of allEvents.reverse()) {
                if (events.has(currentEvent)) {
                    handleEvent(events.get(currentEvent));
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
