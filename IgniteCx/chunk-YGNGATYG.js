import{$a as V,d as j,eb as k,f as A,hb as N,s as S}from"./chunk-RWRBDO2X.js";import{C as p,Ib as L,Ja as d,Qa as i,Ra as m,Sa as v,Ta as w,Yb as u,Z as y,_a as E,ca as g,d as x,db as M,fb as r,gb as T,hb as B,i as h,n as _,o as b,pb as f,qa as z,tb as s,ua as I,ub as D,vb as F,wa as l,za as C}from"./chunk-M4OIVNYR.js";var R=`
    .p-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: dt('avatar.width');
        height: dt('avatar.height');
        font-size: dt('avatar.font.size');
        background: dt('avatar.background');
        color: dt('avatar.color');
        border-radius: dt('avatar.border.radius');
    }

    .p-avatar-image {
        background: transparent;
    }

    .p-avatar-circle {
        border-radius: 50%;
    }

    .p-avatar-circle img {
        border-radius: 50%;
    }

    .p-avatar-icon {
        font-size: dt('avatar.icon.size');
        width: dt('avatar.icon.size');
        height: dt('avatar.icon.size');
    }

    .p-avatar img {
        width: 100%;
        height: 100%;
    }

    .p-avatar-lg {
        width: dt('avatar.lg.width');
        height: dt('avatar.lg.width');
        font-size: dt('avatar.lg.font.size');
    }

    .p-avatar-lg .p-avatar-icon {
        font-size: dt('avatar.lg.icon.size');
        width: dt('avatar.lg.icon.size');
        height: dt('avatar.lg.icon.size');
    }

    .p-avatar-xl {
        width: dt('avatar.xl.width');
        height: dt('avatar.xl.width');
        font-size: dt('avatar.xl.font.size');
    }

    .p-avatar-xl .p-avatar-icon {
        font-size: dt('avatar.xl.icon.size');
        width: dt('avatar.xl.icon.size');
        height: dt('avatar.xl.icon.size');
    }

    .p-avatar-group {
        display: flex;
        align-items: center;
    }

    .p-avatar-group .p-avatar + .p-avatar {
        margin-inline-start: dt('avatar.group.offset');
    }

    .p-avatar-group .p-avatar {
        border: 2px solid dt('avatar.group.border.color');
    }

    .p-avatar-group .p-avatar-lg + .p-avatar-lg {
        margin-inline-start: dt('avatar.lg.group.offset');
    }

    .p-avatar-group .p-avatar-xl + .p-avatar-xl {
        margin-inline-start: dt('avatar.xl.group.offset');
    }
`;var H=["*"];function O(a,o){if(a&1&&(m(0,"span"),D(1),v()),a&2){let t=r();s(t.cx("label")),g(),F(t.label)}}function P(a,o){if(a&1&&w(0,"span",4),a&2){let t=r(2);s(t.icon),i("ngClass",t.cx("icon"))}}function U(a,o){if(a&1&&l(0,P,1,3,"span",3),a&2){let t=r(),n=f(5);i("ngIf",t.icon)("ngIfElse",n)}}function G(a,o){if(a&1){let t=E();m(0,"img",6),M("error",function(e){_(t);let c=r(2);return b(c.imageError(e))}),v()}if(a&2){let t=r(2);i("src",t.image,y),d("aria-label",t.ariaLabel)}}function J(a,o){if(a&1&&l(0,G,1,2,"img",5),a&2){let t=r();i("ngIf",t.image)}}var K={root:({instance:a})=>["p-avatar p-component",{"p-avatar-image":a.image!=null,"p-avatar-circle":a.shape==="circle","p-avatar-lg":a.size==="large","p-avatar-xl":a.size==="xlarge"}],label:"p-avatar-label",icon:"p-avatar-icon"},q=(()=>{class a extends k{name="avatar";theme=R;classes=K;static \u0275fac=(()=>{let t;return function(e){return(t||(t=p(a)))(e||a)}})();static \u0275prov=x({token:a,factory:a.\u0275fac})}return a})();var da=(()=>{class a extends N{label;icon;image;size="normal";shape="square";styleClass;ariaLabel;ariaLabelledBy;onImageError=new C;_componentStyle=h(q);imageError(t){this.onImageError.emit(t)}static \u0275fac=(()=>{let t;return function(e){return(t||(t=p(a)))(e||a)}})();static \u0275cmp=z({type:a,selectors:[["p-avatar"]],hostVars:5,hostBindings:function(n,e){n&2&&(d("data-pc-name","avatar")("aria-label",e.ariaLabel)("aria-labelledby",e.ariaLabelledBy),s(e.cn(e.cx("root"),e.styleClass)))},inputs:{label:"label",icon:"icon",image:"image",size:"size",shape:"shape",styleClass:"styleClass",ariaLabel:"ariaLabel",ariaLabelledBy:"ariaLabelledBy"},outputs:{onImageError:"onImageError"},features:[L([q]),I],ngContentSelectors:H,decls:6,vars:2,consts:[["iconTemplate",""],["imageTemplate",""],[3,"class",4,"ngIf","ngIfElse"],[3,"class","ngClass",4,"ngIf","ngIfElse"],[3,"ngClass"],[3,"src","error",4,"ngIf"],[3,"error","src"]],template:function(n,e){if(n&1&&(T(),B(0),l(1,O,2,3,"span",2)(2,U,1,2,"ng-template",null,0,u)(4,J,1,1,"ng-template",null,1,u)),n&2){let c=f(3);g(),i("ngIf",e.label)("ngIfElse",c)}},dependencies:[S,j,A,V],encapsulation:2,changeDetection:0})}return a})();export{da as a};
