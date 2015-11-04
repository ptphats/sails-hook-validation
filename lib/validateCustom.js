'use strict';

//dependencies

/**
 *
 * @descriptions process validation error and mixin user defined errors
 *               to produce friendly error messages.
 *
 *               For this to work a model may either define `validationMessages`
 *               hash as static property or adding validation messages into
 *               locale files.
 *
 * @param {Object} model valid sails model definition
 * @param {Object} validationErrors a valid sails validation error object.
 *
 * @returns {Object} an object with friendly validation error conversions.
 */
module.exports = function(model, validationError) {

    //grab model validations definitions
    var validations = model._validator.validations;

    //grab field names
    //from the messages
    var validationFields = Object.keys(validations);

    //custom validation error storage
    var customValidationMessages = {};


    //iterate over all model
    //defined validations
    //and process thrown sails ValidationError
    //to model custom defined errors
    validationFields
        .forEach(function(validationField) {
            //grab field errors from the
            //sails validation error hash
            var fieldErrors = validationError[validationField];
            //is there any field
            //error(s) found in ValidationError
            if (fieldErrors) {

                //iterate through each field of
                //sails validation error and
                //convert them
                //to custom model defined errors
                fieldErrors
                    .forEach(function(fieldError) {
                        //try
                        //built custom error message from
                        //from sails i18n

                        //grab phrase to use to find custom message
                        //from locales
                        // var phrase = [
                        //     model.globalId.toLowerCase(),
                        //     validationField,
                        //     fieldError.rule
                        // ].join('.');

                        var phrase = [
                            'MODEL',
                            'FIELD',
                            fieldError.rule.toUpperCase()
                        ].join('_');                        


                        //deduce locale from request else
                        //use default locale
                        var locale =
                            sails.config.i18n.requestLocale ||
                            sails.config.i18n.defaultLocale;

                        //grab custom error
                        //message from config/locales/`locale`.json
                        var customMessage = sails.__({
                            phrase: phrase,
                            locale: locale
                        });

                        //make sure custom error message from i18n exists
                        var i18nMessageExist =
                            customMessage !== phrase &&
                            sails.util._.isString(customMessage);

                        //else
                        //grab friedly error message of
                        //the defined rule which has an error
                        //from model defined
                        //validation messages
                        var messages = model.validationMessages;

                        if (!i18nMessageExist && messages) {
                            customMessage = messages[validationField][fieldError.rule];
                        }

                        if (customMessage) {
                            //collect custom error messages
                            if (!(customValidationMessages[validationField] instanceof Array)) {
                                customValidationMessages[validationField] = [];
                            }

                            //build friendly error message
                            var newMessage = {
                                'rule': fieldError.rule,
                                'message': customMessage
                            };

                            customValidationMessages[validationField].push(newMessage);
                        }
                    });
            } else {
                for (var key in validationError) {
                        
                        var phrase = [
                            'MODEL',
                            'FIELD',
                            key.toUpperCase()
                        ].join('_');                        


                        //deduce locale from request else
                        //use default locale
                        var locale =
                            sails.config.i18n.requestLocale ||
                            sails.config.i18n.defaultLocale;

                        //grab custom error
                        //message from config/locales/`locale`.json
                        var customMessage = sails.__({
                            phrase: phrase,
                            locale: locale
                        });

                        //make sure custom error message from i18n exists
                        var i18nMessageExist =
                            customMessage !== phrase &&
                            sails.util._.isString(customMessage);

                        //else
                        //grab friedly error message of
                        //the defined rule which has an error
                        //from model defined
                        //validation messages
                        var messages = model.validationMessages;

                        if (!i18nMessageExist && messages) {
                            customMessage = messages[key];
                        }

                        if (customMessage) {
                            //collect custom error messages
                            // if (!(customValidationMessages[key] instanceof Array)) {
                                customValidationMessages[key] = [];
                            // }

                            //build friendly error message
                            var newMessage = {
                                'rule': key,
                                'message': customMessage
                            };

                            customValidationMessages[key].push(newMessage);
                        }
                }
            }
        });

    return customValidationMessages;
};
