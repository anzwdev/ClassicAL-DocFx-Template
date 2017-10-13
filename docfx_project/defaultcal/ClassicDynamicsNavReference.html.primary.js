// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.
var common = require('./common.js');

exports.transform = function (model)  {

  if (!model) return null;

  handleItem(model, model._gitContribute, model._gitUrlPattern);

  if (model.items) {
    model.items.forEach(function (item) {
      handleItem(item, model._gitContribute, model._gitUrlPattern);
    });
  }


  return {item: model};
  //return model;
}

exports.getBookmarks = function (model, ignoreChildren)  {
  var bookmarks = {};

  if (typeof ignoreChildren == 'undefined' || ignoreChildren === false) {
    if (model.children) {
      model.children.forEach(function (item) {
        bookmarks[item.uid] = common.getHtmlId(item.uid);
        if (item.overload && item.overload.uid) {
          bookmarks[item.overload.uid] = common.getHtmlId(item.overload.uid);
        }
      });
    }
  }

  // Reference's first level bookmark should have no anchor
  bookmarks[model.uid] = "";
  return bookmarks;
}

exports.groupChildren = groupChildren;
exports.getTypePropertyName = getTypePropertyName;

function groupChildren(model) {
  if (!model || !model.type) {
    return;
  }
  var typeChildrenItems = getDefinitions();
  var grouped = {};

  model.children.forEach(function (c) {
    var type = c.type.toLowerCase();
    if (!grouped.hasOwnProperty(type)) {
      grouped[type] = [];
    }
    // special handle for field
    if (type === "field" && c.syntax) {
      c.syntax.fieldValue = c.syntax.return;
      c.syntax.return = undefined;
    }
    grouped[type].push(c);
  })

  var children = [];
  for (var key in typeChildrenItems) {
    if (typeChildrenItems.hasOwnProperty(key) && grouped.hasOwnProperty(key)) {
      var typeChildrenItem = typeChildrenItems[key];
      var items = grouped[key];
      if (items && items.length > 0) {
        var item = {};
        for (var itemKey in typeChildrenItem) {
          if (typeChildrenItem.hasOwnProperty(itemKey)){
            item[itemKey] = typeChildrenItem[itemKey];
          }
        }
        item.children = items;
        children.push(item);
      }
    }
  }

  model.children = children;
}

function getTypePropertyName(type) {
  if (!type) {
    return undefined;
  }
  var loweredType = type.toLowerCase();
  var definition = getDefinition(loweredType);
  if (definition) {
    return definition.typePropertyName;
  }

  return undefined;
}

function getDefinition(type) {
  var objectItems = getDefinitions();
  if (objectItems.hasOwnProperty(type)) {
    return objectItems[type];
  }
  return undefined;
}

function getDefinitions() {
  var objectItems = {
    "field":          { inField: true,            typePropertyName: "inField",            id: "fields" },
    "procedure":      { inProcedure: true,        typePropertyName: "inProcedure",        id: "procedures" },
    "eventpublisher": { inEventPublisher: true,   typePropertyName: "inEventPublisher",   id: "eventpublishers" },
    "eventsubsriber": { inEventSubscriber: true,  typePropertyName: "inEventSubscriber",  id: "eventsubscribers" },
  };
  return objectItems;

//  console.err("category '" + category + "' is not valid.");
//  return undefined;
}

function handleItem(vm, gitContribute, gitUrlPattern) {
  // get contribution information
  vm.docurl = common.getImproveTheDocHref(vm, gitContribute, gitUrlPattern);
  vm.sourceurl = common.getViewSourceHref(vm, null, gitUrlPattern);

  // set to null incase mustache looks up
  vm.summary = vm.summary || null;
  vm.remarks = vm.remarks || null;
  vm.conceptual = vm.conceptual || null;
  vm.syntax = vm.syntax || null;
  vm.example = vm.example || null;
  common.processSeeAlso(vm);

  // id is used as default template's bookmark
  //if (common)
  //  vm.id = common.getHtmlId(vm.uid);

  if (vm.itemtype) {
    switch (vm.itemtype.toLowerCase()) {
      case 'object':
        vm.isObject = true;
        break;
      case 'procedure':
        vm.isProcedure = true;
        break;
      case 'eventsubscriber':
        vm.isEventSubscriber = true;
        break;
      case 'eventpublisher':
        vm.isEventPublisher = true;
        break;
      case 'group':
        vm.isGroup = true;
        break;
      case 'project':
        vm.isProject = true;
        break;
      default:
        break;
    }
  }

  if (vm.type) {
    switch (vm.type.toLowerCase()) {
      case 'table':
        vm.isTableObject = true;
        break;
      case 'report':
        vm.isReportObject = true;
        break;
      case 'page':
        vm.isPageObject = true;
        break;
      case 'codeunit':
        vm.isCodeUnitObject = true;
        break;
      case 'xmlport':
        vm.isXmlPortObject = true;
        break;
      case 'query':
        vm.isQueryObject = true;
        break;
      default:
        break;
    }
  }


}