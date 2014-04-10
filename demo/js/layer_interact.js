/*
 * layer_interact.js
 */

YUI().use("node", function(Y) {
    Y.namespace("vividLayer");

    Y.vividLayer.demoSetup = function() {
        var Constants = {
            EFFECTS_CLASS: "effects_select",
            LINK_CLASS: "effect_link",
            LAYER_ID: "demo-layer",
            LAYER_CLOSE_CLASS: "layer_close_link",
            MASK_CLASS: "layer_mask",
            IN_SUFFIX: "In",
            OUT_SUFFIX: "Out",
            DEFAULT_EFFECT_DURATION: 250
        };

        var doc = Y.one(document), 
            effectNode = Y.one("." + Constants.EFFECTS_CLASS),
            layerNode = Y.one("#" + Constants.LAYER_ID),
            layerCloseNode = layerNode.one("." + Constants.LAYER_CLOSE_CLASS),
            maskNode = null,
            InEffectClass = "",
            outEffectClass = "",
            endFlag = null;

        function createMask(){
            maskNode = Y.Node.create("<div></div>");
            maskNode.addClass(Constants.MASK_CLASS);
            maskNode.appendTo("body");
        }

        function closeLayer(){
            layerNode.hide();
            layerNode.removeClass(outEffectClass);
            maskNode.hide();
            endFlag = null;
        }

        function showLayer(){
            if(maskNode === null){
                createMask();
            }else{
                maskNode.show();
            }
            layerNode.show();
            layerNode.addClass(InEffectClass);
        }

        function handleClose(event){
            if(endFlag === null && maskNode !== null){
                layerNode.removeClass(InEffectClass);
                layerNode.addClass(outEffectClass);
                endFlag = setTimeout(closeLayer,Constants.DEFAULT_EFFECT_DURATION);
            }
        }

        function handleLayerClick(event){
            event.stopPropagation();
        }

        function handleLinkClick(event){
            var target = event.currentTarget,
            targetValue = target.get("text");

            event.stopPropagation();

            InEffectClass = targetValue + Constants.IN_SUFFIX;
            outEffectClass = targetValue + Constants.OUT_SUFFIX;
            showLayer();
        }

        function bindEvents(){
            effectNode.delegate("click", handleLinkClick, "."+Constants.LINK_CLASS);
            layerNode.on("click",handleLayerClick);
            doc.on("click",handleClose);
            layerCloseNode.on("click",handleClose);
        }

        function init(){
            if(effectNode){
                bindEvents();
            }
        }

        init();
    };

    Y.vividLayer.demoSetup();
});