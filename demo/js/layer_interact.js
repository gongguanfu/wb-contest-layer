/*
 * layer_interact.js
 */

YUI().use("node", function(Y) {
    Y.namespace("vividLayer");

    // 判断是否支持animation
    Y.vividLayer.animation = (function() {
        var animation = false,
            animationstring = 'animation',
            keyframeprefix = '',
            domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
            pfx = '',
            elm = Y.Node.create("<div></div>").getDOMNode();

        if (elm.style.animationName !== undefined) {
            animation = true;
        }

        if (animation === false) {
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                    pfx = domPrefixes[i];
                    animationstring = pfx + 'Animation';
                    keyframeprefix = '-' + pfx.toLowerCase() + '-';
                    animation = true;
                    break;
                }
            }
        }

        return animation;
    }());

    // special效果1 弹性
    Y.vividLayer.specialEffect1 = function(layerNode) {
        var Constants = {
            LAYER_TITLE_CLASS: "layer_title",
            SPRING: 0.05,
            FRICTION: 0.9
        };

        var doc = Y.one(document),
            body = Y.one("body"),
            originGraphicNode = null,
            originX = 0,
            originY = 0,
            layerWidth = 0,
            layerHeight = 0,
            dragOffsetX = 0,
            dragOffsetY = 0,
            isDragging = false;

        // 这个创建层标识浮层原来的位置
        function createOriginGraphic() {
            originGraphicNode = Y.Node.create("<div></div>");
            originGraphicNode.setStyles({
                position: "absolute",
                width: layerWidth,
                height: layerHeight,
                background: "#e75e5e",
                opacity: 0.5,
                left: originX,
                top: originY,
                zIndex: 50
            });
            originGraphicNode.appendTo(body);
        }

        function updateLayerPos(layerX, layerY) {
            layerNode.setXY([layerX, layerY]);
        }

        function handleDrag(event) {
            if (isDragging) {
                var layerX = event.pageX - dragOffsetX,
                    layerY = event.pageY - dragOffsetY;

                updateLayerPos(layerX, layerY);
            }
            event.preventDefault();
        }

        function setAnimationReady() {
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = (function() {
                    return window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function(callback, element) {
                            window.setTimeout(callback, 1000 / 60);
                    };
                })();
            }
        }

        // 弹性运动到原位置
        function startSpringMove(){
            var layerPos = null,
            dx = 0,
            dy = 0,
            dl = 0,
            vx = 0,
            vy = 0,
            vxNext = 0,
            vyNext = 0,
            x = 0,
            y = 0,
            friction = Constants.FRICTION,
            spring = Constants.SPRING;

            // 弹性动画循环
            function animate(){
                layerPos = layerNode.getXY();
                x = layerPos[0];
                y = layerPos[1];

                dx = originX - x;
                dy = originY - y;
                dl = Math.sqrt(dx *dx + dy * dy);

                // console.log("[animate] dx = " + dx);
                // console.log("[animate] dy = " + dy);
                // console.log("[animate] vx = " + vx);
                // console.log("[animate] vy = " + vy);
                // console.log("[animate] dl = " + dl);
                if(Math.abs(dx) > 1 && Math.abs(dy) > 1){
                    vxNext = vx + dx * spring;
                    vyNext = vy + dy * spring;
                    vx =  vxNext;
                    vy = vyNext;
                    x = x + vx;
                    y = y + vy;
                    layerNode.setXY([x, y]);
                    vx *= friction;
                    vy *= friction;
                    requestAnimationFrame(animate);
                }else{
                    layerNode.setXY([originX, originY]);
                    endSpringMove();
                }
            }

            requestAnimationFrame(animate);
        }

        // 结束弹性动画
        function endSpringMove(){
            originGraphicNode.remove();
            originGraphicNode = null;
        }

        function handleDocMouseup(event) {
            if (isDragging) {
                isDragging = false;
                doc.detach("mousemove", handleDrag);
                body.setStyle("cursor", "auto");
                startSpringMove();
            }
        }

        function handleLayerTitleMousedown(event) {
            console.log("[handleLayerTitleMousedown] in effect1");
            var layerPos = layerNode.getXY();
            originX = layerPos[0];
            originY = layerPos[1];
            dragOffsetX = event.pageX - originX;
            dragOffsetY = event.pageY - originY;

            if (originGraphicNode === null) {
                createOriginGraphic();
                isDragging = true;
                doc.on("mousemove", handleDrag);
                body.setStyle("cursor", "move");
            }
            event.preventDefault();
        }

        function assignData() {
            var isHidden = layerNode.getStyle("display") === "none" ? true : false;
            if (isHidden) {
                layerNode.show();
            }
            layerWidth = layerNode.get("offsetWidth");
            layerHeight = layerNode.get("offsetHeight");
            if (isHidden) {
                layerNode.hide();
            }
        }

        function unbindEvents() {
            layerNode.detach();
            doc.detach("mouseup", handleDocMouseup);
        }

        function bindEvents() {
            layerNode.delegate("mousedown", handleLayerTitleMousedown, "." + Constants.LAYER_TITLE_CLASS);
            doc.on("mouseup", handleDocMouseup);
        }

        function init() {
            if (layerNode) {
                assignData();
                setAnimationReady();
                bindEvents();
            }
        }

        init();

        return {
            remove: function() {
                unbindEvents();
            }
        };
    };

    // special效果0 初始 移动浮层
    Y.vividLayer.specialEffect0 = function(layerNode) {
        var Constants = {
            LAYER_TITLE_CLASS: "layer_title"
        };

        var doc = Y.one(document),
            body = Y.one("body"),
            dragGraphicNode = null,
            layerWidth = 0,
            layerHeight = 0,
            graphicOffsetX = 0,
            graphicOffsetY = 0,
            isDragging = false;

        function createDragGraphic(targetX, targetY) {
            dragGraphicNode = Y.Node.create("<div></div>");
            dragGraphicNode.setStyles({
                position: "absolute",
                left: targetX,
                top: targetY,
                width: layerWidth - 4,
                height: layerHeight - 4,
                border: "2px solid #9e9e9e",
                zIndex: 2000
            });
            dragGraphicNode.setData("winWidth", doc.get("winWidth"));
            dragGraphicNode.setData("winHeight", doc.get("winHeight"));
            dragGraphicNode.setData("scrollTop", doc.get("docScrollY"));
            dragGraphicNode.appendTo(body);
        }

        // 根据计算得到的位置，设置替换层的位置
        function updateGraphicPos(graphicX, graphicY) {
            var winWidth = dragGraphicNode.getData("winWidth"),
                winHeight = dragGraphicNode.getData("winHeight"),
                scrollTop = dragGraphicNode.getData("scrollTop"),
                properX = graphicX,
                properY = graphicY;

            if (properX < 0) {
                properX = 0;
            } else if (properX > winWidth - layerWidth) {
                properX = winWidth - layerWidth;
            }

            if (properY < scrollTop) {
                properY = scrollTop;
            } else if (properY > winHeight + scrollTop - layerHeight) {
                properY = winHeight + scrollTop - layerHeight;
            }

            dragGraphicNode.setXY([properX, properY]);
        }

        // 确定移动
        function executeMove() {
            var graphicPos = dragGraphicNode.getXY();
            layerNode.setXY([graphicPos[0], graphicPos[1]]);
        }

        function handleDrag(event) {
            if (isDragging) {
                var graphicX = event.pageX - graphicOffsetX,
                    graphicY = event.pageY - graphicOffsetY;

                updateGraphicPos(graphicX, graphicY);
            }
            event.preventDefault();
        }

        function handleDocMouseup(event) {
            if (isDragging) {
                isDragging = false;
                executeMove();
                doc.detach("mousemove", handleDrag);
                body.setStyle("cursor", "auto");
                dragGraphicNode.remove();
                dragGraphicNode = null;
            }
        }

        function handleLayerTitleMousedown(event) {
            console.log("[handleLayerTitleMousedown] in effect0");
            var layerPos = layerNode.getXY();
            graphicOffsetX = event.pageX - layerPos[0];
            graphicOffsetY = event.pageY - layerPos[1];

            if (dragGraphicNode === null) {
                createDragGraphic(layerPos[0], layerPos[1]);
                isDragging = true;
                doc.on("mousemove", handleDrag);
                body.setStyle("cursor", "move");
            }

            event.preventDefault();
        }

        function assignData() {
            var isHidden = layerNode.getStyle("display") === "none" ? true : false;
            if (isHidden) {
                layerNode.show();
            }
            layerWidth = layerNode.get("offsetWidth");
            layerHeight = layerNode.get("offsetHeight");
            if (isHidden) {
                layerNode.hide();
            }
        }

        function unbindEvents() {
            layerNode.detach();
            doc.detach("mouseup", handleDocMouseup);
        }

        function bindEvents() {
            layerNode.delegate("mousedown", handleLayerTitleMousedown, "." + Constants.LAYER_TITLE_CLASS);
            doc.on("mouseup", handleDocMouseup);
        }

        function init() {
            if (layerNode) {
                assignData();
                bindEvents();
            }
        }

        init();

        return {
            remove: function() {
                console.log("[remove] in effect0");
                unbindEvents();
            }
        };
    };

    // 浮层的普通拖拽，及special效果
    Y.vividLayer.specialSetup = function() {
        var Constants = {
            LAYER_CLASS: "m_layer",
            SPECIAL_LINK_CLASS: "layer_special_link",
            SPECIAL_METHOD_PREFIX: "specialEffect",
            SPECIAL_CLASS_PREFIX: "special_status_"
        };

        var doc = Y.one(document),
            layerNodes = Y.all("." + Constants.LAYER_CLASS),
            currentLayerNode = null,
            isDragging = false,
            totalIndex = 1;

        function updateSpecialType(layerNode, linkNode) {
            var specialIndex = layerNode.getData("specialIndex"),
                effectController = layerNode.getData("effectController");

            // 更改效果指示灯状态
            linkNode.removeClass(Constants.SPECIAL_CLASS_PREFIX + specialIndex);

            specialIndex = specialIndex + 1;
            if (specialIndex > totalIndex) {
                specialIndex = 0;
            }

            // 清除前一个效果
            effectController.remove();

            // 添加下一个效果
            effectController = Y.vividLayer[Constants.SPECIAL_METHOD_PREFIX + specialIndex](layerNode);
            layerNode.setData("specialIndex", specialIndex);
            layerNode.setData("effectController", effectController);
            linkNode.addClass(Constants.SPECIAL_CLASS_PREFIX + specialIndex);
        }

        function handleSpecialClick(event) {
            var target = event.currentTarget,
                relatedLayerNode = target.ancestor("." + Constants.LAYER_CLASS);
                console.log("[handleSpecialClick] relatedLayerNode = ",relatedLayerNode);
            updateSpecialType(relatedLayerNode, target);
        }

        function bindEvents() {
            doc.delegate("click", handleSpecialClick, "." + Constants.SPECIAL_LINK_CLASS);
        }

        function init() {
            if (layerNodes.size()) {
                bindEvents();
                // 初始浮层全部都是效果0
                layerNodes.each(function(layerNode) {
                    var effectController = Y.vividLayer.specialEffect0(layerNode);
                    layerNode.setData("specialIndex", 0);
                    layerNode.setData("effectController", effectController);
                });
            }
        }

        init();
    };

    Y.vividLayer.demoSetup = function() {
        var Constants = {
            EFFECTS_CLASS: "effects_select",
            LINK_CLASS: "effect_link",
            LAYER_ID: "demo-layer",
            LAYER_CLOSE_CLASS: "layer_close_link",
            LAYER_DECLARE_CLASS: "declare",
            MASK_CLASS: "layer_mask",
            IN_SUFFIX: "In",
            OUT_SUFFIX: "Out",
            DEFAULT_EFFECT_DURATION: 250
        };

        var doc = Y.one(document),
            effectNode = Y.one("." + Constants.EFFECTS_CLASS),
            layerNode = Y.one("#" + Constants.LAYER_ID),
            layerCloseNode = layerNode.one("." + Constants.LAYER_CLOSE_CLASS),
            layerDeclareNode = layerNode.one("." + Constants.LAYER_DECLARE_CLASS),
            maskNode = null,
            effectName = "",
            InEffectClass = "",
            outEffectClass = "",
            endFlag = null,
            isLayerShowed = false;

        function createMask() {
            maskNode = Y.Node.create("<div></div>");
            maskNode.addClass(Constants.MASK_CLASS);
            maskNode.appendTo("body");
        }

        function closeLayer() {
            layerNode.hide();
            layerNode.removeClass(outEffectClass);
            maskNode.hide();
            isLayerShowed = false;
            endFlag = null;
        }

        function showLayer() {
            var properX = 0,
                properY = 0;
            if (maskNode === null) {
                createMask();
            } else {
                maskNode.show();
            }
            layerDeclareNode.setHTML("Effect: <em>" + effectName + "</em>");
            layerNode.show();
            properX = (layerNode.get("winWidth") - layerNode.get("offsetWidth")) / 2;
            properY = (layerNode.get("winHeight") + layerNode.get("docScrollY") - layerNode.get("offsetHeight")) / 2;
            layerNode.setXY([properX, properY]);
            isLayerShowed = true;
            layerNode.addClass(InEffectClass);
        }

        function handleClose(event) {
            if (endFlag === null && maskNode !== null && isLayerShowed) {
                layerNode.removeClass(InEffectClass);
                layerNode.addClass(outEffectClass);
                if (Y.vividLayer.animation) {
                    endFlag = setTimeout(closeLayer, Constants.DEFAULT_EFFECT_DURATION);
                } else {
                    closeLayer();
                }
            }
        }

        function handleLayerClick(event) {
            event.stopPropagation();
        }

        function handleLinkClick(event) {
            var target = event.currentTarget,
                targetValue = target.get("text");

            event.stopPropagation();

            if (!isLayerShowed) {
                InEffectClass = targetValue + Constants.IN_SUFFIX;
                outEffectClass = targetValue + Constants.OUT_SUFFIX;
                effectName = targetValue;
                showLayer();
            }
        }

        function bindEvents() {
            effectNode.delegate("click", handleLinkClick, "." + Constants.LINK_CLASS);
            layerNode.on("click", handleLayerClick);
            doc.on("click", handleClose);
            layerCloseNode.on("click", handleClose);
        }

        function init() {
            if (effectNode) {
                bindEvents();
            }
        }

        init();
    };

    Y.vividLayer.specialSetup();
    Y.vividLayer.demoSetup();
});