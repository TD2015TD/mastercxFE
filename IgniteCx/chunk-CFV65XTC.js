import{a as ze}from"./chunk-X4PS6D2K.js";import{a as Te,b as Ae,c as De}from"./chunk-IKJNSYHP.js";import{c as ke,d as Le,y as Fe}from"./chunk-4FXFHTTJ.js";import{b as Ee}from"./chunk-RTMNV6VQ.js";import{$a as ve,Da as fe,Ga as K,Ha as A,Ia as W,Ka as J,Qa as ye,Xa as xe,_a as be,ab as we,d as ue,e as de,eb as Ce,f as me,fb as Ie,ia as H,j as _e,ja as k,k as he,mb as Oe,s as ge,ub as Se,vb as Ve,wb as Me}from"./chunk-RWRBDO2X.js";import{Aa as oe,Ab as ae,Bb as pe,C as ee,Ib as re,Ja as x,Jb as se,Kb as V,Lb as $,Mb as Z,Qa as r,Ra as m,Sa as _,Ta as D,Xa as T,Ya as S,Yb as L,Za as O,_a as I,bc as q,c as X,ca as s,d as Y,db as b,fb as a,gc as ce,i as G,ia as P,ib as v,jb as M,kb as g,lb as f,n as u,o as d,p as F,pb as U,pc as y,qa as te,qb as ie,qc as E,sb as R,tb as h,ua as ne,ub as z,vb as N,wa as c,wb as j,x as Q,za as C,zb as le}from"./chunk-M4OIVNYR.js";var Ke=`
    .p-autocomplete {
        display: inline-flex;
    }

    .p-autocomplete-loader {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        inset-inline-end: dt('autocomplete.padding.x');
    }

    .p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-loader {
        inset-inline-end: calc(dt('autocomplete.dropdown.width') + dt('autocomplete.padding.x'));
    }

    .p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-input {
        flex: 1 1 auto;
        width: 1%;
    }

    .p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-input,
    .p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-input-multiple {
        border-start-end-radius: 0;
        border-end-end-radius: 0;
    }

    .p-autocomplete-dropdown {
        cursor: pointer;
        display: inline-flex;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        width: dt('autocomplete.dropdown.width');
        border-start-end-radius: dt('autocomplete.dropdown.border.radius');
        border-end-end-radius: dt('autocomplete.dropdown.border.radius');
        background: dt('autocomplete.dropdown.background');
        border: 1px solid dt('autocomplete.dropdown.border.color');
        border-inline-start: 0 none;
        color: dt('autocomplete.dropdown.color');
        transition:
            background dt('autocomplete.transition.duration'),
            color dt('autocomplete.transition.duration'),
            border-color dt('autocomplete.transition.duration'),
            outline-color dt('autocomplete.transition.duration'),
            box-shadow dt('autocomplete.transition.duration');
        outline-color: transparent;
    }

    .p-autocomplete-dropdown:not(:disabled):hover {
        background: dt('autocomplete.dropdown.hover.background');
        border-color: dt('autocomplete.dropdown.hover.border.color');
        color: dt('autocomplete.dropdown.hover.color');
    }

    .p-autocomplete-dropdown:not(:disabled):active {
        background: dt('autocomplete.dropdown.active.background');
        border-color: dt('autocomplete.dropdown.active.border.color');
        color: dt('autocomplete.dropdown.active.color');
    }

    .p-autocomplete-dropdown:focus-visible {
        box-shadow: dt('autocomplete.dropdown.focus.ring.shadow');
        outline: dt('autocomplete.dropdown.focus.ring.width') dt('autocomplete.dropdown.focus.ring.style') dt('autocomplete.dropdown.focus.ring.color');
        outline-offset: dt('autocomplete.dropdown.focus.ring.offset');
    }

    .p-autocomplete-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('autocomplete.overlay.background');
        color: dt('autocomplete.overlay.color');
        border: 1px solid dt('autocomplete.overlay.border.color');
        border-radius: dt('autocomplete.overlay.border.radius');
        box-shadow: dt('autocomplete.overlay.shadow');
        min-width: 100%;
    }

    .p-autocomplete-list-container {
        overflow: auto;
    }

    .p-autocomplete-list {
        margin: 0;
        list-style-type: none;
        display: flex;
        flex-direction: column;
        gap: dt('autocomplete.list.gap');
        padding: dt('autocomplete.list.padding');
    }

    .p-autocomplete-option {
        cursor: pointer;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: dt('autocomplete.option.padding');
        border: 0 none;
        color: dt('autocomplete.option.color');
        background: transparent;
        transition:
            background dt('autocomplete.transition.duration'),
            color dt('autocomplete.transition.duration'),
            border-color dt('autocomplete.transition.duration');
        border-radius: dt('autocomplete.option.border.radius');
    }

    .p-autocomplete-option:not(.p-autocomplete-option-selected):not(.p-disabled).p-focus {
        background: dt('autocomplete.option.focus.background');
        color: dt('autocomplete.option.focus.color');
    }

    .p-autocomplete-option-selected {
        background: dt('autocomplete.option.selected.background');
        color: dt('autocomplete.option.selected.color');
    }

    .p-autocomplete-option-selected.p-focus {
        background: dt('autocomplete.option.selected.focus.background');
        color: dt('autocomplete.option.selected.focus.color');
    }

    .p-autocomplete-option-group {
        margin: 0;
        padding: dt('autocomplete.option.group.padding');
        color: dt('autocomplete.option.group.color');
        background: dt('autocomplete.option.group.background');
        font-weight: dt('autocomplete.option.group.font.weight');
    }

    .p-autocomplete-input-multiple {
        margin: 0;
        list-style-type: none;
        cursor: text;
        overflow: hidden;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding: calc(dt('autocomplete.padding.y') / 2) dt('autocomplete.padding.x');
        gap: calc(dt('autocomplete.padding.y') / 2);
        color: dt('autocomplete.color');
        background: dt('autocomplete.background');
        border: 1px solid dt('autocomplete.border.color');
        border-radius: dt('autocomplete.border.radius');
        width: 100%;
        transition:
            background dt('autocomplete.transition.duration'),
            color dt('autocomplete.transition.duration'),
            border-color dt('autocomplete.transition.duration'),
            outline-color dt('autocomplete.transition.duration'),
            box-shadow dt('autocomplete.transition.duration');
        outline-color: transparent;
        box-shadow: dt('autocomplete.shadow');
    }

    .p-autocomplete-input-multiple.p-disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-autocomplete:not(.p-disabled):hover .p-autocomplete-input-multiple {
        border-color: dt('autocomplete.hover.border.color');
    }

    .p-autocomplete:not(.p-disabled).p-focus .p-autocomplete-input-multiple {
        border-color: dt('autocomplete.focus.border.color');
        box-shadow: dt('autocomplete.focus.ring.shadow');
        outline: dt('autocomplete.focus.ring.width') dt('autocomplete.focus.ring.style') dt('autocomplete.focus.ring.color');
        outline-offset: dt('autocomplete.focus.ring.offset');
    }

    .p-autocomplete.p-invalid .p-autocomplete-input-multiple {
        border-color: dt('autocomplete.invalid.border.color');
    }

    .p-variant-filled.p-autocomplete-input-multiple {
        background: dt('autocomplete.filled.background');
    }

    .p-autocomplete:not(.p-disabled):hover .p-variant-filled.p-autocomplete-input-multiple {
        background: dt('autocomplete.filled.hover.background');
    }

    .p-autocomplete:not(.p-disabled).p-focus .p-variant-filled.p-autocomplete-input-multiple {
        background: dt('autocomplete.filled.focus.background');
    }

    .p-autocomplete.p-disabled .p-autocomplete-input-multiple {
        opacity: 1;
        background: dt('autocomplete.disabled.background');
        color: dt('autocomplete.disabled.color');
    }

    .p-autocomplete-chip.p-chip {
        padding-block-start: calc(dt('autocomplete.padding.y') / 2);
        padding-block-end: calc(dt('autocomplete.padding.y') / 2);
        border-radius: dt('autocomplete.chip.border.radius');
    }

    .p-autocomplete-input-multiple:has(.p-autocomplete-chip) {
        padding-inline-start: calc(dt('autocomplete.padding.y') / 2);
        padding-inline-end: calc(dt('autocomplete.padding.y') / 2);
    }

    .p-autocomplete-chip-item.p-focus .p-autocomplete-chip {
        background: dt('autocomplete.chip.focus.background');
        color: dt('autocomplete.chip.focus.color');
    }

    .p-autocomplete-input-chip {
        flex: 1 1 auto;
        display: inline-flex;
        padding-block-start: calc(dt('autocomplete.padding.y') / 2);
        padding-block-end: calc(dt('autocomplete.padding.y') / 2);
    }

    .p-autocomplete-input-chip input {
        border: 0 none;
        outline: 0 none;
        background: transparent;
        margin: 0;
        padding: 0;
        box-shadow: none;
        border-radius: 0;
        width: 100%;
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: inherit;
    }

    .p-autocomplete-input-chip input::placeholder {
        color: dt('autocomplete.placeholder.color');
    }

    .p-autocomplete.p-invalid .p-autocomplete-input-chip input::placeholder {
        color: dt('autocomplete.invalid.placeholder.color');
    }

    .p-autocomplete-empty-message {
        padding: dt('autocomplete.empty.message.padding');
    }

    .p-autocomplete-fluid {
        display: flex;
    }

    .p-autocomplete-fluid:has(.p-autocomplete-dropdown) .p-autocomplete-input {
        width: 1%;
    }

    .p-autocomplete:has(.p-inputtext-sm) .p-autocomplete-dropdown {
        width: dt('autocomplete.dropdown.sm.width');
    }

    .p-autocomplete:has(.p-inputtext-sm) .p-autocomplete-dropdown .p-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
    }

    .p-autocomplete:has(.p-inputtext-lg) .p-autocomplete-dropdown {
        width: dt('autocomplete.dropdown.lg.width');
    }

    .p-autocomplete:has(.p-inputtext-lg) .p-autocomplete-dropdown .p-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
    }

    .p-autocomplete-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        color: dt('autocomplete.dropdown.color');
        inset-inline-end: dt('autocomplete.padding.x');
    }

    .p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-clear-icon {
        inset-inline-end: calc(dt('autocomplete.padding.x') + dt('autocomplete.dropdown.width'));
    }
`;var qe=["item"],He=["empty"],Be=["header"],Ge=["footer"],Pe=["selecteditem"],Ue=["group"],Ne=["loader"],je=["removeicon"],Ze=["loadingicon"],We=["clearicon"],Je=["dropdownicon"],Xe=["focusInput"],Ye=["multiIn"],et=["multiContainer"],tt=["ddBtn"],nt=["items"],ot=["scroller"],it=["overlay"],lt=t=>({i:t}),Re=t=>({$implicit:t}),at=(t,l,e)=>({removeCallback:t,index:l,class:e}),B=t=>({height:t}),$e=(t,l)=>({$implicit:t,options:l}),pt=t=>({options:t}),rt=()=>({}),st=(t,l,e)=>({option:t,i:l,scrollerOptions:e}),ct=(t,l)=>({$implicit:t,index:l});function ut(t,l){if(t&1){let e=I();m(0,"input",17,2),b("input",function(o){u(e);let i=a();return d(i.onInput(o))})("keydown",function(o){u(e);let i=a();return d(i.onKeyDown(o))})("change",function(o){u(e);let i=a();return d(i.onInputChange(o))})("focus",function(o){u(e);let i=a();return d(i.onInputFocus(o))})("blur",function(o){u(e);let i=a();return d(i.onInputBlur(o))})("paste",function(o){u(e);let i=a();return d(i.onInputPaste(o))})("keyup",function(o){u(e);let i=a();return d(i.onInputKeyUp(o))}),_()}if(t&2){let e=a();h(e.cn(e.cx("pcInputText"),e.inputStyleClass)),r("pAutoFocus",e.autofocus)("ngStyle",e.inputStyle)("variant",e.$variant())("invalid",e.invalid())("pSize",e.size())("fluid",e.hasFluid),x("type",e.type)("value",e.inputValue())("id",e.inputId)("autocomplete",e.autocomplete)("placeholder",e.placeholder)("name",e.name())("minlength",e.minlength())("min",e.min())("max",e.max())("pattern",e.pattern())("size",e.inputSize())("maxlength",e.maxlength())("tabindex",e.$disabled()?-1:e.tabindex)("required",e.required()?"":void 0)("readonly",e.readonly?"":void 0)("disabled",e.$disabled()?"":void 0)("aria-label",e.ariaLabel)("aria-labelledby",e.ariaLabelledBy)("aria-required",e.required())("aria-expanded",e.overlayVisible??!1)("aria-controls",e.overlayVisible?e.id+"_list":null)("aria-activedescendant",e.focused?e.focusedOptionId:void 0)}}function dt(t,l){if(t&1){let e=I();F(),m(0,"svg",20),b("click",function(){u(e);let o=a(2);return d(o.clear())}),_()}if(t&2){let e=a(2);h(e.cx("clearIcon")),x("aria-hidden",!0)}}function mt(t,l){}function _t(t,l){t&1&&c(0,mt,0,0,"ng-template")}function ht(t,l){if(t&1){let e=I();m(0,"span",21),b("click",function(){u(e);let o=a(2);return d(o.clear())}),c(1,_t,1,0,null,22),_()}if(t&2){let e=a(2);h(e.cx("clearIcon")),x("aria-hidden",!0),s(),r("ngTemplateOutlet",e.clearIconTemplate||e._clearIconTemplate)}}function gt(t,l){if(t&1&&(T(0),c(1,dt,1,3,"svg",18)(2,ht,2,4,"span",19),S()),t&2){let e=a();s(),r("ngIf",!e.clearIconTemplate&&!e._clearIconTemplate),s(),r("ngIf",e.clearIconTemplate||e._clearIconTemplate)}}function ft(t,l){t&1&&O(0)}function yt(t,l){if(t&1){let e=I();m(0,"span",21),b("click",function(o){u(e);let i=a(2).index,p=a(2);return d(p.readonly?"":p.removeOption(o,i))}),F(),D(1,"svg",29),_()}if(t&2){let e=a(4);h(e.cx("chipIcon")),s(),h(e.cx("chipIcon")),x("aria-hidden",!0)}}function xt(t,l){}function bt(t,l){t&1&&c(0,xt,0,0,"ng-template")}function vt(t,l){if(t&1&&(m(0,"span"),c(1,bt,1,0,null,28),_()),t&2){let e=a(2).index,n=a(2);x("aria-hidden",!0),s(),r("ngTemplateOutlet",n.removeIconTemplate||n._removeIconTemplate)("ngTemplateOutletContext",Z(3,at,n.removeOption.bind(n),e,n.cx("chipIcon")))}}function wt(t,l){if(t&1&&c(0,yt,2,5,"span",19)(1,vt,2,7,"span",13),t&2){let e=a(3);r("ngIf",!e.removeIconTemplate&&!e._removeIconTemplate),s(),r("ngIf",e.removeIconTemplate||e._removeIconTemplate)}}function Ct(t,l){if(t&1){let e=I();m(0,"li",25,4)(2,"p-chip",27),b("onRemove",function(o){let i=u(e).index,p=a(2);return d(p.readonly?"":p.removeOption(o,i))}),c(3,ft,1,0,"ng-container",28)(4,wt,2,2,"ng-template",null,5,L),_()()}if(t&2){let e=l.$implicit,n=l.index,o=a(2);h(o.cx("chipItem",V(13,lt,n))),x("id",o.id+"_multiple_option_"+n)("aria-label",o.getOptionLabel(e))("aria-setsize",o.modelValue().length)("aria-posinset",n+1)("aria-selected",!0),s(2),h(o.cx("pcChip")),r("label",!o.selectedItemTemplate&&!o._selectedItemTemplate&&o.getOptionLabel(e))("removable",!0),s(),r("ngTemplateOutlet",o.selectedItemTemplate||o._selectedItemTemplate)("ngTemplateOutletContext",V(15,Re,e))}}function It(t,l){if(t&1){let e=I();m(0,"ul",23,3),b("focus",function(o){u(e);let i=a();return d(i.onMultipleContainerFocus(o))})("blur",function(o){u(e);let i=a();return d(i.onMultipleContainerBlur(o))})("keydown",function(o){u(e);let i=a();return d(i.onMultipleContainerKeyDown(o))}),c(2,Ct,6,17,"li",24),m(3,"li",25)(4,"input",26,2),b("input",function(o){u(e);let i=a();return d(i.onInput(o))})("keydown",function(o){u(e);let i=a();return d(i.onKeyDown(o))})("change",function(o){u(e);let i=a();return d(i.onInputChange(o))})("focus",function(o){u(e);let i=a();return d(i.onInputFocus(o))})("blur",function(o){u(e);let i=a();return d(i.onInputBlur(o))})("paste",function(o){u(e);let i=a();return d(i.onInputPaste(o))})("keyup",function(o){u(e);let i=a();return d(i.onInputKeyUp(o))}),_()()()}if(t&2){let e=a();h(e.cx("inputMultiple")),r("tabindex",-1),x("aria-orientation","horizontal")("aria-activedescendant",e.focused?e.focusedMultipleOptionId:void 0),s(2),r("ngForOf",e.modelValue()),s(),h(e.cx("inputChip")),s(),h(e.cx("pcInputText")),r("pAutoFocus",e.autofocus)("ngStyle",e.inputStyle),x("type",e.type)("id",e.inputId)("autocomplete",e.autocomplete)("name",e.name())("minlength",e.minlength())("maxlength",e.maxlength())("size",e.size())("min",e.min())("max",e.max())("pattern",e.pattern())("placeholder",e.$filled()?null:e.placeholder)("tabindex",e.$disabled()?-1:e.tabindex)("required",e.required()?"":void 0)("readonly",e.readonly?"":void 0)("disabled",e.$disabled()?"":void 0)("aria-label",e.ariaLabel)("aria-labelledby",e.ariaLabelledBy)("aria-required",e.required())("aria-expanded",e.overlayVisible??!1)("aria-controls",e.overlayVisible?e.id+"_list":null)("aria-activedescendant",e.focused?e.focusedOptionId:void 0)}}function Ot(t,l){if(t&1&&(F(),D(0,"svg",32)),t&2){let e=a(2);h(e.cx("loader")),r("spin",!0),x("aria-hidden",!0)}}function Tt(t,l){}function St(t,l){t&1&&c(0,Tt,0,0,"ng-template")}function Vt(t,l){if(t&1&&(m(0,"span"),c(1,St,1,0,null,22),_()),t&2){let e=a(2);h(e.cx("loader")),x("aria-hidden",!0),s(),r("ngTemplateOutlet",e.loadingIconTemplate||e._loadingIconTemplate)}}function kt(t,l){if(t&1&&(T(0),c(1,Ot,1,4,"svg",30)(2,Vt,2,4,"span",31),S()),t&2){let e=a();s(),r("ngIf",!e.loadingIconTemplate&&!e._loadingIconTemplate),s(),r("ngIf",e.loadingIconTemplate||e._loadingIconTemplate)}}function Mt(t,l){if(t&1&&D(0,"span",35),t&2){let e=a(2);r("ngClass",e.dropdownIcon),x("aria-hidden",!0)}}function Et(t,l){t&1&&(F(),D(0,"svg",37))}function At(t,l){}function Lt(t,l){t&1&&c(0,At,0,0,"ng-template")}function Ft(t,l){if(t&1&&(T(0),c(1,Et,1,0,"svg",36)(2,Lt,1,0,null,22),S()),t&2){let e=a(2);s(),r("ngIf",!e.dropdownIconTemplate&&!e._dropdownIconTemplate),s(),r("ngTemplateOutlet",e.dropdownIconTemplate||e._dropdownIconTemplate)}}function Dt(t,l){if(t&1){let e=I();m(0,"button",33,6),b("click",function(o){u(e);let i=a();return d(i.handleDropdownClick(o))}),c(2,Mt,1,2,"span",34)(3,Ft,3,2,"ng-container",13),_()}if(t&2){let e=a();h(e.cx("dropdown")),r("disabled",e.$disabled()),x("aria-label",e.dropdownAriaLabel)("tabindex",e.tabindex),s(2),r("ngIf",e.dropdownIcon),s(),r("ngIf",!e.dropdownIcon)}}function zt(t,l){t&1&&O(0)}function Kt(t,l){t&1&&O(0)}function Qt(t,l){if(t&1&&c(0,Kt,1,0,"ng-container",28),t&2){let e=l.$implicit,n=l.options;a(2);let o=U(6);r("ngTemplateOutlet",o)("ngTemplateOutletContext",$(2,$e,e,n))}}function Rt(t,l){t&1&&O(0)}function $t(t,l){if(t&1&&c(0,Rt,1,0,"ng-container",28),t&2){let e=l.options,n=a(4);r("ngTemplateOutlet",n.loaderTemplate||n._loaderTemplate)("ngTemplateOutletContext",V(2,pt,e))}}function qt(t,l){t&1&&(T(0),c(1,$t,1,4,"ng-template",null,9,L),S())}function Ht(t,l){if(t&1){let e=I();m(0,"p-scroller",41,8),b("onLazyLoad",function(o){u(e);let i=a(2);return d(i.onLazyLoad.emit(o))}),c(2,Qt,1,5,"ng-template",null,1,L)(4,qt,3,0,"ng-container",13),_()}if(t&2){let e=a(2);R(V(8,B,e.scrollHeight)),r("items",e.visibleOptions())("itemSize",e.virtualScrollItemSize)("autoSize",!0)("lazy",e.lazy)("options",e.virtualScrollOptions),s(4),r("ngIf",e.loaderTemplate||e._loaderTemplate)}}function Bt(t,l){t&1&&O(0)}function Gt(t,l){if(t&1&&(T(0),c(1,Bt,1,0,"ng-container",28),S()),t&2){a();let e=U(6),n=a();s(),r("ngTemplateOutlet",e)("ngTemplateOutletContext",$(3,$e,n.visibleOptions(),se(2,rt)))}}function Pt(t,l){if(t&1&&(m(0,"span"),z(1),_()),t&2){let e=a(2).$implicit,n=a(3);s(),N(n.getOptionGroupLabel(e.optionGroup))}}function Ut(t,l){t&1&&O(0)}function Nt(t,l){if(t&1&&(T(0),m(1,"li",45),c(2,Pt,2,1,"span",13)(3,Ut,1,0,"ng-container",28),_(),S()),t&2){let e=a(),n=e.$implicit,o=e.index,i=a().options,p=a(2);s(),h(p.cx("optionGroup")),r("ngStyle",V(7,B,i.itemSize+"px")),x("id",p.id+"_"+p.getOptionIndex(o,i)),s(),r("ngIf",!p.groupTemplate),s(),r("ngTemplateOutlet",p.groupTemplate)("ngTemplateOutletContext",V(9,Re,n.optionGroup))}}function jt(t,l){if(t&1&&(m(0,"span"),z(1),_()),t&2){let e=a(2).$implicit,n=a(3);s(),N(n.getOptionLabel(e))}}function Zt(t,l){t&1&&O(0)}function Wt(t,l){if(t&1){let e=I();T(0),m(1,"li",46),b("click",function(o){u(e);let i=a().$implicit,p=a(3);return d(p.onOptionSelect(o,i))})("mouseenter",function(o){u(e);let i=a().index,p=a().options,w=a(2);return d(w.onOptionMouseEnter(o,w.getOptionIndex(i,p)))}),c(2,jt,2,1,"span",13)(3,Zt,1,0,"ng-container",28),_(),S()}if(t&2){let e=a(),n=e.$implicit,o=e.index,i=a().options,p=a(2);s(),h(p.cx("option",Z(13,st,n,o,i))),r("ngStyle",V(17,B,i.itemSize+"px")),x("id",p.id+"_"+p.getOptionIndex(o,i))("aria-label",p.getOptionLabel(n))("aria-selected",p.isSelected(n))("aria-disabled",p.isOptionDisabled(n))("data-p-focused",p.focusedOptionIndex()===p.getOptionIndex(o,i))("aria-setsize",p.ariaSetSize)("aria-posinset",p.getAriaPosInset(p.getOptionIndex(o,i))),s(),r("ngIf",!p.itemTemplate&&!p._itemTemplate),s(),r("ngTemplateOutlet",p.itemTemplate||p._itemTemplate)("ngTemplateOutletContext",$(19,ct,n,i.getOptions?i.getOptions(o):o))}}function Jt(t,l){if(t&1&&c(0,Nt,4,11,"ng-container",13)(1,Wt,4,22,"ng-container",13),t&2){let e=l.$implicit,n=a(3);r("ngIf",n.isOptionGroup(e)),s(),r("ngIf",!n.isOptionGroup(e))}}function Xt(t,l){if(t&1&&(T(0),z(1),S()),t&2){let e=a(4);s(),j(" ",e.searchResultMessageText," ")}}function Yt(t,l){t&1&&O(0,null,11)}function en(t,l){if(t&1&&(m(0,"li",45),c(1,Xt,2,1,"ng-container",47)(2,Yt,2,0,"ng-container",22),_()),t&2){let e=a().options,n=a(2);h(n.cx("emptyMessage")),r("ngStyle",V(6,B,e.itemSize+"px")),s(),r("ngIf",!n.emptyTemplate&&!n._emptyTemplate)("ngIfElse",n.empty),s(),r("ngTemplateOutlet",n.emptyTemplate||n._emptyTemplate)}}function tn(t,l){if(t&1&&(m(0,"ul",42,10),c(2,Jt,2,2,"ng-template",43)(3,en,3,8,"li",44),_()),t&2){let e=l.$implicit,n=l.options,o=a(2);R(n.contentStyle),h(o.cn(o.cx("list"),n.contentStyleClass)),x("id",o.id+"_list")("aria-label",o.listLabel),s(2),r("ngForOf",e),s(),r("ngIf",!e||e&&e.length===0&&o.showEmptyMessage)}}function nn(t,l){t&1&&O(0)}function on(t,l){if(t&1&&(m(0,"div",38),c(1,zt,1,0,"ng-container",22),m(2,"div"),c(3,Ht,5,10,"p-scroller",39)(4,Gt,2,6,"ng-container",13),_(),c(5,tn,4,8,"ng-template",null,7,L)(7,nn,1,0,"ng-container",22),_(),m(8,"span",40),z(9),_()),t&2){let e=a();h(e.cn(e.cx("overlay"),e.panelStyleClass)),r("ngStyle",e.panelStyle),s(),r("ngTemplateOutlet",e.headerTemplate||e._headerTemplate),s(),h(e.cx("listContainer")),ie("max-height",e.virtualScroll?"auto":e.scrollHeight),s(),r("ngIf",e.virtualScroll),s(),r("ngIf",!e.virtualScroll),s(3),r("ngTemplateOutlet",e.footerTemplate||e._footerTemplate),s(2),j(" ",e.selectedMessageText," ")}}var ln=`
    ${Ke}

    /* For PrimeNG */
    p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input,
    p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input-multiple,
    p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input,
    p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input-multiple p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input,
    p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input-multiple {
        border-color: dt('autocomplete.invalid.border.color');
    }

    p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input:enabled:focus,
    p-autoComplete.ng-invalid.ng-dirty:not(.p-disabled).p-focus .p-autocomplete-input-multiple,
    p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input:enabled:focus,
    p-auto-complete.ng-invalid.ng-dirty:not(.p-disabled).p-focus .p-autocomplete-input-multiple,
    p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input:enabled:focus,
    p-autocomplete.ng-invalid.ng-dirty:not(.p-disabled).p-focus .p-autocomplete-input-multiple {
        border-color: dt('autocomplete.focus.border.color');
    }

    p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input-chip input::placeholder,
    p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input-chip input::placeholder,
    p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input-chip input::placeholder {
        color: dt('autocomplete.invalid.placeholder.color');
    }

    p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input::placeholder,
    p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input::placeholder,
    p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input::placeholder {
        color: dt('autocomplete.invalid.placeholder.color');
    }
`,an={root:{position:"relative"}},pn={root:({instance:t})=>["p-autocomplete p-component p-inputwrapper",{"p-invalid":t.invalid(),"p-focus":t.focused,"p-inputwrapper-filled":t.$filled(),"p-inputwrapper-focus":t.focused&&!t.$disabled()||t.autofocus||t.overlayVisible,"p-autocomplete-open":t.overlayVisible,"p-autocomplete-clearable":t.showClear&&!t.$disabled(),"p-autocomplete-fluid":t.hasFluid}],pcInputText:"p-autocomplete-input",inputMultiple:({instance:t})=>["p-autocomplete-input-multiple",{"p-disabled":t.$disabled(),"p-variant-filled":t.$variant()==="filled"}],chipItem:({instance:t,i:l})=>["p-autocomplete-chip-item",{"p-focus":t.focusedMultipleOptionIndex()===l}],pcChip:"p-autocomplete-chip",chipIcon:"p-autocomplete-chip-icon",inputChip:"p-autocomplete-input-chip",loader:"p-autocomplete-loader",dropdown:"p-autocomplete-dropdown",overlay:({instance:t})=>["p-autocomplete-overlay p-component-overlay p-component",{"p-input-filled":t.$variant()==="filled","p-ripple-disabled":t.config.ripple()===!1}],listContainer:"p-autocomplete-list-container",list:"p-autocomplete-list",optionGroup:"p-autocomplete-option-group",option:({instance:t,option:l,i:e,scrollerOptions:n})=>({"p-autocomplete-option":!0,"p-autocomplete-option-selected":t.isSelected(l),"p-focus":t.focusedOptionIndex()===t.getOptionIndex(e,n),"p-disabled":t.isOptionDisabled(l)}),emptyMessage:"p-autocomplete-empty-message",clearIcon:"p-autocomplete-clear-icon"},Qe=(()=>{class t extends Ce{name="autocomplete";theme=ln;classes=pn;inlineStyles=an;static \u0275fac=(()=>{let e;return function(o){return(e||(e=ee(t)))(o||t)}})();static \u0275prov=Y({token:t,factory:t.\u0275fac})}return t})();var rn={provide:Ee,useExisting:X(()=>sn),multi:!0},sn=(()=>{class t extends Ae{overlayService;zone;minLength=1;minQueryLength;delay=300;panelStyle;styleClass;panelStyleClass;inputStyle;inputId;inputStyleClass;placeholder;readonly;scrollHeight="200px";lazy=!1;virtualScroll;virtualScrollItemSize;virtualScrollOptions;autoHighlight;forceSelection;type="text";autoZIndex=!0;baseZIndex=0;ariaLabel;dropdownAriaLabel;ariaLabelledBy;dropdownIcon;unique=!0;group;completeOnFocus=!1;showClear=!1;dropdown;showEmptyMessage=!0;dropdownMode="blank";multiple;tabindex;dataKey;emptyMessage;showTransitionOptions=".12s cubic-bezier(0, 0, 0.2, 1)";hideTransitionOptions=".1s linear";autofocus;autocomplete="off";optionGroupChildren="items";optionGroupLabel="label";overlayOptions;get suggestions(){return this._suggestions()}set suggestions(e){this._suggestions.set(e),this.handleSuggestionsChange()}optionLabel;optionValue;id;searchMessage;emptySelectionMessage;selectionMessage;autoOptionFocus=!1;selectOnFocus;searchLocale;optionDisabled;focusOnHover=!0;typeahead=!0;appendTo=ce(void 0);completeMethod=new C;onSelect=new C;onUnselect=new C;onFocus=new C;onBlur=new C;onDropdownClick=new C;onClear=new C;onKeyUp=new C;onShow=new C;onHide=new C;onLazyLoad=new C;inputEL;multiInputEl;multiContainerEL;dropdownButton;itemsViewChild;scroller;overlayViewChild;itemsWrapper;itemTemplate;emptyTemplate;headerTemplate;footerTemplate;selectedItemTemplate;groupTemplate;loaderTemplate;removeIconTemplate;loadingIconTemplate;clearIconTemplate;dropdownIconTemplate;onHostClick(e){this.onContainerClick(e)}primeng=G(Ie);value;_suggestions=Q(null);timeout;overlayVisible;suggestionsUpdated;highlightOption;highlightOptionChanged;focused=!1;loading;scrollHandler;listId;searchTimeout;dirty=!1;_itemTemplate;_groupTemplate;_selectedItemTemplate;_headerTemplate;_emptyTemplate;_footerTemplate;_loaderTemplate;_removeIconTemplate;_loadingIconTemplate;_clearIconTemplate;_dropdownIconTemplate;focusedMultipleOptionIndex=Q(-1);focusedOptionIndex=Q(-1);_componentStyle=G(Qe);$appendTo=q(()=>this.appendTo()||this.config.overlayAppendTo());visibleOptions=q(()=>this.group?this.flatOptions(this._suggestions()):this._suggestions()||[]);inputValue=q(()=>{let e=this.modelValue(),n=this.optionValueSelected?(this.suggestions||[]).find(o=>A(o,this.optionValue)===e):e;if(K(e))if(typeof e=="object"||this.optionValueSelected){let o=this.getOptionLabel(n);return o??e}else return e;else return""});get focusedMultipleOptionId(){return this.focusedMultipleOptionIndex()!==-1?`${this.id}_multiple_option_${this.focusedMultipleOptionIndex()}`:null}get focusedOptionId(){return this.focusedOptionIndex()!==-1?`${this.id}_${this.focusedOptionIndex()}`:null}get searchResultMessageText(){return K(this.visibleOptions())&&this.overlayVisible?this.searchMessageText.replaceAll("{0}",this.visibleOptions().length):this.emptySearchMessageText}get searchMessageText(){return this.searchMessage||this.config.translation.searchMessage||""}get emptySearchMessageText(){return this.emptyMessage||this.config.translation.emptySearchMessage||""}get selectionMessageText(){return this.selectionMessage||this.config.translation.selectionMessage||""}get emptySelectionMessageText(){return this.emptySelectionMessage||this.config.translation.emptySelectionMessage||""}get selectedMessageText(){return this.hasSelectedOption()?this.selectionMessageText.replaceAll("{0}",this.multiple?this.modelValue()?.length:"1"):this.emptySelectionMessageText}get ariaSetSize(){return this.visibleOptions().filter(e=>!this.isOptionGroup(e)).length}get listLabel(){return this.config.getTranslation(we.ARIA).listLabel}get virtualScrollerDisabled(){return!this.virtualScroll}get optionValueSelected(){return typeof this.modelValue()=="string"&&this.optionValue}chipItemClass(e){return this._componentStyle.classes.chipItem({instance:this,i:e})}constructor(e,n){super(),this.overlayService=e,this.zone=n}ngOnInit(){super.ngOnInit(),this.id=this.id||ye("pn_id_"),this.cd.detectChanges()}templates;ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"item":this._itemTemplate=e.template;break;case"group":this._groupTemplate=e.template;break;case"selecteditem":this._selectedItemTemplate=e.template;break;case"selectedItem":this._selectedItemTemplate=e.template;break;case"header":this._headerTemplate=e.template;break;case"empty":this._emptyTemplate=e.template;break;case"footer":this._footerTemplate=e.template;break;case"loader":this._loaderTemplate=e.template;break;case"removetokenicon":this._removeIconTemplate=e.template;break;case"loadingicon":this._loadingIconTemplate=e.template;break;case"clearicon":this._clearIconTemplate=e.template;break;case"dropdownicon":this._dropdownIconTemplate=e.template;break;default:this._itemTemplate=e.template;break}})}ngAfterViewChecked(){this.suggestionsUpdated&&this.overlayViewChild&&this.zone.runOutsideAngular(()=>{setTimeout(()=>{this.overlayViewChild&&this.overlayViewChild.alignOverlay()},1),this.suggestionsUpdated=!1})}handleSuggestionsChange(){if(this.loading){this._suggestions()?.length>0||this.showEmptyMessage||this.emptyTemplate?this.show():this.hide();let e=this.overlayVisible&&this.autoOptionFocus?this.findFirstFocusedOptionIndex():-1;this.focusedOptionIndex.set(e),this.suggestionsUpdated=!0,this.loading=!1,this.cd.markForCheck()}}flatOptions(e){return(e||[]).reduce((n,o,i)=>{n.push({optionGroup:o,group:!0,index:i});let p=this.getOptionGroupChildren(o);return p&&p.forEach(w=>n.push(w)),n},[])}isOptionGroup(e){return this.optionGroupLabel&&e.optionGroup&&e.group}findFirstOptionIndex(){return this.visibleOptions().findIndex(e=>this.isValidOption(e))}findLastOptionIndex(){return J(this.visibleOptions(),e=>this.isValidOption(e))}findFirstFocusedOptionIndex(){let e=this.findSelectedOptionIndex();return e<0?this.findFirstOptionIndex():e}findLastFocusedOptionIndex(){let e=this.findSelectedOptionIndex();return e<0?this.findLastOptionIndex():e}findSelectedOptionIndex(){return this.hasSelectedOption()?this.visibleOptions().findIndex(e=>this.isValidSelectedOption(e)):-1}findNextOptionIndex(e){let n=e<this.visibleOptions().length-1?this.visibleOptions().slice(e+1).findIndex(o=>this.isValidOption(o)):-1;return n>-1?n+e+1:e}findPrevOptionIndex(e){let n=e>0?J(this.visibleOptions().slice(0,e),o=>this.isValidOption(o)):-1;return n>-1?n:e}isValidSelectedOption(e){return this.isValidOption(e)&&this.isSelected(e)}isValidOption(e){return e&&!(this.isOptionDisabled(e)||this.isOptionGroup(e))}isOptionDisabled(e){return this.optionDisabled?A(e,this.optionDisabled):!1}isSelected(e){return this.multiple?this.unique?this.modelValue()?.find(n=>W(n,this.getOptionValue(e),this.equalityKey())):!1:W(this.modelValue(),this.getOptionValue(e),this.equalityKey())}isOptionMatched(e,n){return this.isValidOption(e)&&this.getOptionLabel(e).toLocaleLowerCase(this.searchLocale)===n.toLocaleLowerCase(this.searchLocale)}isInputClicked(e){return e.target===this.inputEL.nativeElement}isDropdownClicked(e){return this.dropdownButton?.nativeElement?e.target===this.dropdownButton.nativeElement||this.dropdownButton.nativeElement.contains(e.target):!1}equalityKey(){return this.dataKey}onContainerClick(e){this.$disabled()||this.loading||this.isInputClicked(e)||this.isDropdownClicked(e)||(!this.overlayViewChild||!this.overlayViewChild.overlayViewChild?.nativeElement.contains(e.target))&&k(this.inputEL.nativeElement)}handleDropdownClick(e){let n;this.overlayVisible?this.hide(!0):(k(this.inputEL.nativeElement),n=this.inputEL.nativeElement.value,this.dropdownMode==="blank"?this.search(e,"","dropdown"):this.dropdownMode==="current"&&this.search(e,n,"dropdown")),this.onDropdownClick.emit({originalEvent:e,query:n})}onInput(e){if(this.typeahead){let n=this.minQueryLength||this.minLength;this.searchTimeout&&clearTimeout(this.searchTimeout);let o=e.target.value;this.maxlength()!==null&&(o=o.split("").slice(0,this.maxlength()).join("")),!this.multiple&&!this.forceSelection&&this.updateModel(o),o.length===0&&!this.multiple?(this.onClear.emit(),setTimeout(()=>{this.hide()},this.delay/2)):o.length>=n?(this.focusedOptionIndex.set(-1),this.searchTimeout=setTimeout(()=>{this.search(e,o,"input")},this.delay)):this.hide()}}onInputChange(e){if(this.forceSelection){let n=!1;if(this.visibleOptions()){let o=this.visibleOptions().find(i=>this.isOptionMatched(i,this.inputEL.nativeElement.value||""));o!==void 0&&(n=!0,!this.isSelected(o)&&this.onOptionSelect(e,o))}n||(this.inputEL.nativeElement.value="",!this.multiple&&this.updateModel(null))}}onInputFocus(e){if(this.$disabled())return;!this.dirty&&this.completeOnFocus&&this.search(e,e.target.value,"focus"),this.dirty=!0,this.focused=!0;let n=this.focusedOptionIndex()!==-1?this.focusedOptionIndex():this.overlayVisible&&this.autoOptionFocus?this.findFirstFocusedOptionIndex():-1;this.focusedOptionIndex.set(n),this.overlayVisible&&this.scrollInView(this.focusedOptionIndex()),this.onFocus.emit(e)}onMultipleContainerFocus(e){this.$disabled()||(this.focused=!0)}onMultipleContainerBlur(e){this.focusedMultipleOptionIndex.set(-1),this.focused=!1}onMultipleContainerKeyDown(e){if(this.$disabled()){e.preventDefault();return}switch(e.code){case"ArrowLeft":this.onArrowLeftKeyOnMultiple(e);break;case"ArrowRight":this.onArrowRightKeyOnMultiple(e);break;case"Backspace":this.onBackspaceKeyOnMultiple(e);break;default:break}}onInputBlur(e){this.dirty=!1,this.focused=!1,this.focusedOptionIndex.set(-1),this.onModelTouched(),this.onBlur.emit(e)}onInputPaste(e){this.onKeyDown(e)}onInputKeyUp(e){this.onKeyUp.emit(e)}onKeyDown(e){if(this.$disabled()){e.preventDefault();return}switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e);break;case"ArrowLeft":this.onArrowLeftKey(e);break;case"ArrowRight":this.onArrowRightKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"PageDown":this.onPageDownKey(e);break;case"PageUp":this.onPageUpKey(e);break;case"Enter":case"NumpadEnter":this.onEnterKey(e);break;case"Escape":this.onEscapeKey(e);break;case"Tab":this.onTabKey(e);break;case"Backspace":this.onBackspaceKey(e);break;case"ShiftLeft":case"ShiftRight":break;default:break}}onArrowDownKey(e){if(!this.overlayVisible)return;let n=this.focusedOptionIndex()!==-1?this.findNextOptionIndex(this.focusedOptionIndex()):this.findFirstFocusedOptionIndex();this.changeFocusedOptionIndex(e,n),e.preventDefault(),e.stopPropagation()}onArrowUpKey(e){if(this.overlayVisible)if(e.altKey)this.focusedOptionIndex()!==-1&&this.onOptionSelect(e,this.visibleOptions()[this.focusedOptionIndex()]),this.overlayVisible&&this.hide(),e.preventDefault();else{let n=this.focusedOptionIndex()!==-1?this.findPrevOptionIndex(this.focusedOptionIndex()):this.findLastFocusedOptionIndex();this.changeFocusedOptionIndex(e,n),e.preventDefault(),e.stopPropagation()}}onArrowLeftKey(e){let n=e.currentTarget;this.focusedOptionIndex.set(-1),this.multiple&&(fe(n.value)&&this.hasSelectedOption()?(k(this.multiContainerEL.nativeElement),this.focusedMultipleOptionIndex.set(this.modelValue().length)):e.stopPropagation())}onArrowRightKey(e){this.focusedOptionIndex.set(-1),this.multiple&&e.stopPropagation()}onHomeKey(e){let{currentTarget:n}=e,o=n.value.length;n.setSelectionRange(0,e.shiftKey?o:0),this.focusedOptionIndex.set(-1),e.preventDefault()}onEndKey(e){let{currentTarget:n}=e,o=n.value.length;n.setSelectionRange(e.shiftKey?0:o,o),this.focusedOptionIndex.set(-1),e.preventDefault()}onPageDownKey(e){this.scrollInView(this.visibleOptions().length-1),e.preventDefault()}onPageUpKey(e){this.scrollInView(0),e.preventDefault()}onEnterKey(e){if(this.typeahead||this.multiple&&(this.updateModel([...this.modelValue()||[],e.target.value]),this.inputEL.nativeElement.value=""),this.overlayVisible)this.focusedOptionIndex()!==-1&&this.onOptionSelect(e,this.visibleOptions()[this.focusedOptionIndex()]),this.hide();else return;e.preventDefault()}onEscapeKey(e){this.overlayVisible&&this.hide(!0),e.preventDefault()}onTabKey(e){this.focusedOptionIndex()!==-1&&this.onOptionSelect(e,this.visibleOptions()[this.focusedOptionIndex()]),this.overlayVisible&&this.hide()}onBackspaceKey(e){if(this.multiple){if(K(this.modelValue())&&!this.inputEL.nativeElement.value){let n=this.modelValue()[this.modelValue().length-1],o=this.modelValue().slice(0,-1);this.updateModel(o),this.onUnselect.emit({originalEvent:e,value:n})}e.stopPropagation()}!this.multiple&&this.showClear&&this.findSelectedOptionIndex()!=-1&&this.clear()}onArrowLeftKeyOnMultiple(e){let n=this.focusedMultipleOptionIndex()<1?0:this.focusedMultipleOptionIndex()-1;this.focusedMultipleOptionIndex.set(n)}onArrowRightKeyOnMultiple(e){let n=this.focusedMultipleOptionIndex();n++,this.focusedMultipleOptionIndex.set(n),n>this.modelValue().length-1&&(this.focusedMultipleOptionIndex.set(-1),k(this.inputEL.nativeElement))}onBackspaceKeyOnMultiple(e){this.focusedMultipleOptionIndex()!==-1&&this.removeOption(e,this.focusedMultipleOptionIndex())}onOptionSelect(e,n,o=!0){let i=this.getOptionValue(n);this.multiple?(this.inputEL.nativeElement.value="",this.isSelected(n)||this.updateModel([...this.modelValue()||[],i])):this.updateModel(i),this.onSelect.emit({originalEvent:e,value:n}),o&&this.hide(!0)}onOptionMouseEnter(e,n){this.focusOnHover&&this.changeFocusedOptionIndex(e,n)}search(e,n,o){n!=null&&(o==="input"&&n.trim().length===0||(this.loading=!0,this.completeMethod.emit({originalEvent:e,query:n})))}removeOption(e,n){e.stopPropagation();let o=this.modelValue()[n],i=this.modelValue().filter((p,w)=>w!==n);this.updateModel(i),this.onUnselect.emit({originalEvent:e,value:o}),k(this.inputEL.nativeElement)}updateModel(e){this.value=e,this.writeModelValue(e),this.onModelChange(e),this.updateInputValue(),this.cd.markForCheck()}updateInputValue(){this.inputEL&&this.inputEL.nativeElement&&(this.multiple?this.inputEL.nativeElement.value="":this.inputEL.nativeElement.value=this.inputValue())}autoUpdateModel(){if((this.selectOnFocus||this.autoHighlight)&&this.autoOptionFocus&&!this.hasSelectedOption()){let e=this.findFirstFocusedOptionIndex();this.focusedOptionIndex.set(e),this.onOptionSelect(null,this.visibleOptions()[this.focusedOptionIndex()],!1)}}scrollInView(e=-1){let n=e!==-1?`${this.id}_${e}`:this.focusedOptionId;if(this.itemsViewChild&&this.itemsViewChild.nativeElement){let o=H(this.itemsViewChild.nativeElement,`li[id="${n}"]`);o?o.scrollIntoView&&o.scrollIntoView({block:"nearest",inline:"nearest"}):this.virtualScrollerDisabled||setTimeout(()=>{this.virtualScroll&&this.scroller?.scrollToIndex(e!==-1?e:this.focusedOptionIndex())},0)}}changeFocusedOptionIndex(e,n){this.focusedOptionIndex()!==n&&(this.focusedOptionIndex.set(n),this.scrollInView(),this.selectOnFocus&&this.onOptionSelect(e,this.visibleOptions()[n],!1))}show(e=!1){this.dirty=!0,this.overlayVisible=!0;let n=this.focusedOptionIndex()!==-1?this.focusedOptionIndex():this.autoOptionFocus?this.findFirstFocusedOptionIndex():-1;this.focusedOptionIndex.set(n),e&&k(this.inputEL.nativeElement),e&&k(this.inputEL.nativeElement),this.onShow.emit(),this.cd.markForCheck()}hide(e=!1){let n=()=>{this.dirty=e,this.overlayVisible=!1,this.focusedOptionIndex.set(-1),e&&k(this.inputEL.nativeElement),this.onHide.emit(),this.cd.markForCheck()};setTimeout(()=>{n()},0)}clear(){this.updateModel(null),this.inputEL.nativeElement.value="",this.onClear.emit()}hasSelectedOption(){return K(this.modelValue())}getAriaPosInset(e){return(this.optionGroupLabel?e-this.visibleOptions().slice(0,e).filter(n=>this.isOptionGroup(n)).length:e)+1}getOptionLabel(e){return this.optionLabel?A(e,this.optionLabel):e&&e.label!=null?e.label:e}getOptionValue(e){return this.optionValue?A(e,this.optionValue):e&&e.value!=null?e.value:e}getOptionIndex(e,n){return this.virtualScrollerDisabled?e:n&&n.getItemOptions(e).index}getOptionGroupLabel(e){return this.optionGroupLabel?A(e,this.optionGroupLabel):e&&e.label!=null?e.label:e}getOptionGroupChildren(e){return this.optionGroupChildren?A(e,this.optionGroupChildren):e.items}onOverlayAnimationStart(e){if(e.toState==="visible"&&(this.itemsWrapper=H(this.overlayViewChild.overlayViewChild?.nativeElement,this.virtualScroll?".p-scroller":".p-autocomplete-panel"),this.virtualScroll&&(this.scroller?.setContentEl(this.itemsViewChild?.nativeElement),this.scroller.viewInit()),this.visibleOptions()&&this.visibleOptions().length))if(this.virtualScroll){let n=this.modelValue()?this.focusedOptionIndex():-1;n!==-1&&this.scroller?.scrollToIndex(n)}else{let n=H(this.itemsWrapper,".p-autocomplete-item.p-highlight");n&&n.scrollIntoView({block:"nearest",inline:"center"})}}writeControlValue(e,n){this.value=e,n(e),this.updateInputValue(),this.cd.markForCheck()}ngOnDestroy(){this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),super.ngOnDestroy()}static \u0275fac=function(n){return new(n||t)(P(xe),P(oe))};static \u0275cmp=te({type:t,selectors:[["p-autoComplete"],["p-autocomplete"],["p-auto-complete"]],contentQueries:function(n,o,i){if(n&1&&(v(i,qe,5),v(i,He,5),v(i,Be,5),v(i,Ge,5),v(i,Pe,5),v(i,Ue,5),v(i,Ne,5),v(i,je,5),v(i,Ze,5),v(i,We,5),v(i,Je,5),v(i,be,4)),n&2){let p;g(p=f())&&(o.itemTemplate=p.first),g(p=f())&&(o.emptyTemplate=p.first),g(p=f())&&(o.headerTemplate=p.first),g(p=f())&&(o.footerTemplate=p.first),g(p=f())&&(o.selectedItemTemplate=p.first),g(p=f())&&(o.groupTemplate=p.first),g(p=f())&&(o.loaderTemplate=p.first),g(p=f())&&(o.removeIconTemplate=p.first),g(p=f())&&(o.loadingIconTemplate=p.first),g(p=f())&&(o.clearIconTemplate=p.first),g(p=f())&&(o.dropdownIconTemplate=p.first),g(p=f())&&(o.templates=p)}},viewQuery:function(n,o){if(n&1&&(M(Xe,5),M(Ye,5),M(et,5),M(tt,5),M(nt,5),M(ot,5),M(it,5)),n&2){let i;g(i=f())&&(o.inputEL=i.first),g(i=f())&&(o.multiInputEl=i.first),g(i=f())&&(o.multiContainerEL=i.first),g(i=f())&&(o.dropdownButton=i.first),g(i=f())&&(o.itemsViewChild=i.first),g(i=f())&&(o.scroller=i.first),g(i=f())&&(o.overlayViewChild=i.first)}},hostVars:4,hostBindings:function(n,o){n&1&&b("click",function(p){return o.onHostClick(p)}),n&2&&(R(o.sx("root")),h(o.cn(o.cx("root"),o.styleClass)))},inputs:{minLength:[2,"minLength","minLength",E],minQueryLength:[2,"minQueryLength","minQueryLength",E],delay:[2,"delay","delay",E],panelStyle:"panelStyle",styleClass:"styleClass",panelStyleClass:"panelStyleClass",inputStyle:"inputStyle",inputId:"inputId",inputStyleClass:"inputStyleClass",placeholder:"placeholder",readonly:[2,"readonly","readonly",y],scrollHeight:"scrollHeight",lazy:[2,"lazy","lazy",y],virtualScroll:[2,"virtualScroll","virtualScroll",y],virtualScrollItemSize:[2,"virtualScrollItemSize","virtualScrollItemSize",E],virtualScrollOptions:"virtualScrollOptions",autoHighlight:[2,"autoHighlight","autoHighlight",y],forceSelection:[2,"forceSelection","forceSelection",y],type:"type",autoZIndex:[2,"autoZIndex","autoZIndex",y],baseZIndex:[2,"baseZIndex","baseZIndex",E],ariaLabel:"ariaLabel",dropdownAriaLabel:"dropdownAriaLabel",ariaLabelledBy:"ariaLabelledBy",dropdownIcon:"dropdownIcon",unique:[2,"unique","unique",y],group:[2,"group","group",y],completeOnFocus:[2,"completeOnFocus","completeOnFocus",y],showClear:[2,"showClear","showClear",y],dropdown:[2,"dropdown","dropdown",y],showEmptyMessage:[2,"showEmptyMessage","showEmptyMessage",y],dropdownMode:"dropdownMode",multiple:[2,"multiple","multiple",y],tabindex:[2,"tabindex","tabindex",E],dataKey:"dataKey",emptyMessage:"emptyMessage",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",autofocus:[2,"autofocus","autofocus",y],autocomplete:"autocomplete",optionGroupChildren:"optionGroupChildren",optionGroupLabel:"optionGroupLabel",overlayOptions:"overlayOptions",suggestions:"suggestions",optionLabel:"optionLabel",optionValue:"optionValue",id:"id",searchMessage:"searchMessage",emptySelectionMessage:"emptySelectionMessage",selectionMessage:"selectionMessage",autoOptionFocus:[2,"autoOptionFocus","autoOptionFocus",y],selectOnFocus:[2,"selectOnFocus","selectOnFocus",y],searchLocale:[2,"searchLocale","searchLocale",y],optionDisabled:"optionDisabled",focusOnHover:[2,"focusOnHover","focusOnHover",y],typeahead:[2,"typeahead","typeahead",y],appendTo:[1,"appendTo"]},outputs:{completeMethod:"completeMethod",onSelect:"onSelect",onUnselect:"onUnselect",onFocus:"onFocus",onBlur:"onBlur",onDropdownClick:"onDropdownClick",onClear:"onClear",onKeyUp:"onKeyUp",onShow:"onShow",onHide:"onHide",onLazyLoad:"onLazyLoad"},features:[re([rn,Qe]),ne],decls:9,vars:12,consts:[["overlay",""],["content",""],["focusInput",""],["multiContainer",""],["token",""],["removeicon",""],["ddBtn",""],["buildInItems",""],["scroller",""],["loader",""],["items",""],["empty",""],["pInputText","","aria-autocomplete","list","role","combobox",3,"pAutoFocus","class","ngStyle","variant","invalid","pSize","fluid","input","keydown","change","focus","blur","paste","keyup",4,"ngIf"],[4,"ngIf"],["role","listbox",3,"class","tabindex","focus","blur","keydown",4,"ngIf"],["type","button","pRipple","",3,"class","disabled","click",4,"ngIf"],[3,"visibleChange","onAnimationStart","onHide","hostAttrSelector","visible","options","target","appendTo","showTransitionOptions","hideTransitionOptions"],["pInputText","","aria-autocomplete","list","role","combobox",3,"input","keydown","change","focus","blur","paste","keyup","pAutoFocus","ngStyle","variant","invalid","pSize","fluid"],["data-p-icon","times",3,"class","click",4,"ngIf"],[3,"class","click",4,"ngIf"],["data-p-icon","times",3,"click"],[3,"click"],[4,"ngTemplateOutlet"],["role","listbox",3,"focus","blur","keydown","tabindex"],["role","option",3,"class",4,"ngFor","ngForOf"],["role","option"],["role","combobox","aria-autocomplete","list",3,"input","keydown","change","focus","blur","paste","keyup","pAutoFocus","ngStyle"],[3,"onRemove","label","removable"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["data-p-icon","times-circle"],["data-p-icon","spinner",3,"class","spin",4,"ngIf"],[3,"class",4,"ngIf"],["data-p-icon","spinner",3,"spin"],["type","button","pRipple","",3,"click","disabled"],[3,"ngClass",4,"ngIf"],[3,"ngClass"],["data-p-icon","chevron-down",4,"ngIf"],["data-p-icon","chevron-down"],[3,"ngStyle"],[3,"items","style","itemSize","autoSize","lazy","options","onLazyLoad",4,"ngIf"],["role","status","aria-live","polite",1,"p-hidden-accessible"],[3,"onLazyLoad","items","itemSize","autoSize","lazy","options"],["role","listbox"],["ngFor","",3,"ngForOf"],["role","option",3,"class","ngStyle",4,"ngIf"],["role","option",3,"ngStyle"],["pRipple","","role","option",3,"click","mouseenter","ngStyle"],[4,"ngIf","ngIfElse"]],template:function(n,o){if(n&1){let i=I();c(0,ut,2,30,"input",12)(1,gt,3,2,"ng-container",13)(2,It,6,33,"ul",14)(3,kt,3,2,"ng-container",13)(4,Dt,4,7,"button",15),m(5,"p-overlay",16,0),pe("visibleChange",function(w){return u(i),ae(o.overlayVisible,w)||(o.overlayVisible=w),d(w)}),b("onAnimationStart",function(w){return u(i),d(o.onOverlayAnimationStart(w))})("onHide",function(){return u(i),d(o.hide())}),c(7,on,10,12,"ng-template",null,1,L),_()}n&2&&(r("ngIf",!o.multiple),s(),r("ngIf",o.$filled()&&!o.$disabled()&&o.showClear&&!o.loading),s(),r("ngIf",o.multiple),s(),r("ngIf",o.loading),s(),r("ngIf",o.dropdown),s(),r("hostAttrSelector",o.attrSelector),le("visible",o.overlayVisible),r("options",o.overlayOptions)("target","@parent")("appendTo",o.$appendTo())("showTransitionOptions",o.showTransitionOptions)("hideTransitionOptions",o.hideTransitionOptions))},dependencies:[ge,ue,de,me,he,_e,De,Le,Me,Fe,Oe,ke,Se,Te,ze,ve,Ve],encapsulation:2,changeDetection:0})}return t})();export{sn as a};
