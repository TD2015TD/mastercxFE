import{A as G,b as $,f as T}from"./chunk-RTMNV6VQ.js";import{$a as l,eb as N,mb as O,s as R}from"./chunk-RWRBDO2X.js";import{C as h,Ib as j,Ja as d,Qa as I,Ra as g,Sa as m,Ta as _,_a as z,bc as A,c as w,ca as f,d as p,db as V,e as x,gc as v,i as u,jb as D,kb as E,lb as S,n as s,o as c,pc as y,qa as C,qc as L,r as B,ra as M,tb as a,ua as F,za as b}from"./chunk-M4OIVNYR.js";var Q=`
    .p-radiobutton {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('radiobutton.width');
        height: dt('radiobutton.height');
    }

    .p-radiobutton-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: 50%;
    }

    .p-radiobutton-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        border: 1px solid dt('radiobutton.border.color');
        background: dt('radiobutton.background');
        width: dt('radiobutton.width');
        height: dt('radiobutton.height');
        transition:
            background dt('radiobutton.transition.duration'),
            color dt('radiobutton.transition.duration'),
            border-color dt('radiobutton.transition.duration'),
            box-shadow dt('radiobutton.transition.duration'),
            outline-color dt('radiobutton.transition.duration');
        outline-color: transparent;
        box-shadow: dt('radiobutton.shadow');
    }

    .p-radiobutton-icon {
        transition-duration: dt('radiobutton.transition.duration');
        background: transparent;
        font-size: dt('radiobutton.icon.size');
        width: dt('radiobutton.icon.size');
        height: dt('radiobutton.icon.size');
        border-radius: 50%;
        backface-visibility: hidden;
        transform: translateZ(0) scale(0.1);
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:hover) .p-radiobutton-box {
        border-color: dt('radiobutton.hover.border.color');
    }

    .p-radiobutton-checked .p-radiobutton-box {
        border-color: dt('radiobutton.checked.border.color');
        background: dt('radiobutton.checked.background');
    }

    .p-radiobutton-checked .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.checked.color');
        transform: translateZ(0) scale(1, 1);
        visibility: visible;
    }

    .p-radiobutton-checked:not(.p-disabled):has(.p-radiobutton-input:hover) .p-radiobutton-box {
        border-color: dt('radiobutton.checked.hover.border.color');
        background: dt('radiobutton.checked.hover.background');
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:hover).p-radiobutton-checked .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.checked.hover.color');
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:focus-visible) .p-radiobutton-box {
        border-color: dt('radiobutton.focus.border.color');
        box-shadow: dt('radiobutton.focus.ring.shadow');
        outline: dt('radiobutton.focus.ring.width') dt('radiobutton.focus.ring.style') dt('radiobutton.focus.ring.color');
        outline-offset: dt('radiobutton.focus.ring.offset');
    }

    .p-radiobutton-checked:not(.p-disabled):has(.p-radiobutton-input:focus-visible) .p-radiobutton-box {
        border-color: dt('radiobutton.checked.focus.border.color');
    }

    .p-radiobutton.p-invalid > .p-radiobutton-box {
        border-color: dt('radiobutton.invalid.border.color');
    }

    .p-radiobutton.p-variant-filled .p-radiobutton-box {
        background: dt('radiobutton.filled.background');
    }

    .p-radiobutton.p-variant-filled.p-radiobutton-checked .p-radiobutton-box {
        background: dt('radiobutton.checked.background');
    }

    .p-radiobutton.p-variant-filled:not(.p-disabled):has(.p-radiobutton-input:hover).p-radiobutton-checked .p-radiobutton-box {
        background: dt('radiobutton.checked.hover.background');
    }

    .p-radiobutton.p-disabled {
        opacity: 1;
    }

    .p-radiobutton.p-disabled .p-radiobutton-box {
        background: dt('radiobutton.disabled.background');
        border-color: dt('radiobutton.checked.disabled.border.color');
    }

    .p-radiobutton-checked.p-disabled .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.disabled.color');
    }

    .p-radiobutton-sm,
    .p-radiobutton-sm .p-radiobutton-box {
        width: dt('radiobutton.sm.width');
        height: dt('radiobutton.sm.height');
    }

    .p-radiobutton-sm .p-radiobutton-icon {
        font-size: dt('radiobutton.icon.sm.size');
        width: dt('radiobutton.icon.sm.size');
        height: dt('radiobutton.icon.sm.size');
    }

    .p-radiobutton-lg,
    .p-radiobutton-lg .p-radiobutton-box {
        width: dt('radiobutton.lg.width');
        height: dt('radiobutton.lg.height');
    }

    .p-radiobutton-lg .p-radiobutton-icon {
        font-size: dt('radiobutton.icon.lg.size');
        width: dt('radiobutton.icon.lg.size');
        height: dt('radiobutton.icon.lg.size');
    }
`;var U=["input"],Z=`
    ${Q}

    /* For PrimeNG */
    p-radioButton.ng-invalid.ng-dirty .p-radiobutton-box,
    p-radio-button.ng-invalid.ng-dirty .p-radiobutton-box,
    p-radiobutton.ng-invalid.ng-dirty .p-radiobutton-box {
        border-color: dt('radiobutton.invalid.border.color');
    }
`,J={root:({instance:o})=>["p-radiobutton p-component",{"p-radiobutton-checked":o.checked,"p-disabled":o.$disabled(),"p-invalid":o.invalid(),"p-variant-filled":o.$variant()==="filled","p-radiobutton-sm p-inputfield-sm":o.size()==="small","p-radiobutton-lg p-inputfield-lg":o.size()==="large"}],box:"p-radiobutton-box",input:"p-radiobutton-input",icon:"p-radiobutton-icon"},q=(()=>{class o extends N{name="radiobutton";theme=Z;classes=J;static \u0275fac=(()=>{let t;return function(i){return(t||(t=h(o)))(i||o)}})();static \u0275prov=p({token:o,factory:o.\u0275fac})}return o})();var K={provide:$,useExisting:w(()=>H),multi:!0},P=(()=>{class o{accessors=[];add(t,n){this.accessors.push([t,n])}remove(t){this.accessors=this.accessors.filter(n=>n[1]!==t)}select(t){this.accessors.forEach(n=>{this.isSameGroup(n,t)&&n[1]!==t&&n[1].writeValue(t.value)})}isSameGroup(t,n){return t[0].control?t[0].control.root===n.control.control.root&&t[1].name()===n.name():!1}static \u0275fac=function(n){return new(n||o)};static \u0275prov=p({token:o,factory:o.\u0275fac,providedIn:"root"})}return o})(),H=(()=>{class o extends G{value;tabindex;inputId;ariaLabelledBy;ariaLabel;styleClass;autofocus;binary;variant=v();size=v();onClick=new b;onFocus=new b;onBlur=new b;inputViewChild;$variant=A(()=>this.variant()||this.config.inputStyle()||this.config.inputVariant());checked;focused;control;_componentStyle=u(q);injector=u(B);registry=u(P);ngOnInit(){super.ngOnInit(),this.control=this.injector.get(T),this.registry.add(this.control,this)}onChange(t){this.$disabled()||this.select(t)}select(t){this.$disabled()||(this.checked=!0,this.writeModelValue(this.checked),this.onModelChange(this.value),this.registry.select(this),this.onClick.emit({originalEvent:t,value:this.value}))}onInputFocus(t){this.focused=!0,this.onFocus.emit(t)}onInputBlur(t){this.focused=!1,this.onModelTouched(),this.onBlur.emit(t)}focus(){this.inputViewChild.nativeElement.focus()}writeControlValue(t,n){this.checked=this.binary?!!t:t==this.value,n(this.checked),this.cd.markForCheck()}ngOnDestroy(){this.registry.remove(this),super.ngOnDestroy()}static \u0275fac=(()=>{let t;return function(i){return(t||(t=h(o)))(i||o)}})();static \u0275cmp=C({type:o,selectors:[["p-radioButton"],["p-radiobutton"],["p-radio-button"]],viewQuery:function(n,i){if(n&1&&D(U,5),n&2){let e;E(e=S())&&(i.inputViewChild=e.first)}},hostVars:4,hostBindings:function(n,i){n&2&&(d("data-pc-name","radiobutton")("data-pc-section","root"),a(i.cx("root")))},inputs:{value:"value",tabindex:[2,"tabindex","tabindex",L],inputId:"inputId",ariaLabelledBy:"ariaLabelledBy",ariaLabel:"ariaLabel",styleClass:"styleClass",autofocus:[2,"autofocus","autofocus",y],binary:[2,"binary","binary",y],variant:[1,"variant"],size:[1,"size"]},outputs:{onClick:"onClick",onFocus:"onFocus",onBlur:"onBlur"},features:[j([K,q]),F],decls:4,vars:19,consts:[["input",""],["type","radio",3,"focus","blur","change","checked","pAutoFocus"]],template:function(n,i){if(n&1){let e=z();g(0,"input",1,0),V("focus",function(r){return s(e),c(i.onInputFocus(r))})("blur",function(r){return s(e),c(i.onInputBlur(r))})("change",function(r){return s(e),c(i.onChange(r))}),m(),g(2,"div"),_(3,"div"),m()}n&2&&(a(i.cx("input")),I("checked",i.checked)("pAutoFocus",i.autofocus),d("id",i.inputId)("name",i.name())("required",i.required()?"":void 0)("disabled",i.$disabled()?"":void 0)("value",i.modelValue())("aria-labelledby",i.ariaLabelledBy)("aria-label",i.ariaLabel)("tabindex",i.tabindex)("aria-checked",i.checked),f(2),a(i.cx("box")),d("data-pc-section","input"),f(),a(i.cx("icon")),d("data-pc-section","icon"))},dependencies:[R,O,l],encapsulation:2,changeDetection:0})}return o})(),ht=(()=>{class o{static \u0275fac=function(n){return new(n||o)};static \u0275mod=M({type:o});static \u0275inj=x({imports:[H,l,l]})}return o})();export{H as a,ht as b};
