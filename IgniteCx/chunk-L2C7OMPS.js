import{$a as N,_a as E,d as S,eb as O,f as z,hb as q,k as B,s as Q}from"./chunk-RWRBDO2X.js";import{C as g,Ib as F,Qa as i,Ra as p,Sa as u,Ta as h,Xa as k,Ya as x,ca as o,d as v,fb as l,gb as I,hb as M,i as T,ib as f,kb as m,lb as y,pc as j,qa as b,tb as c,ua as C,ub as w,vb as D,wa as r}from"./chunk-M4OIVNYR.js";var A=`
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`;var R=["icon"],V=["*"];function H(t,s){if(t&1&&h(0,"span",3),t&2){let e=l(2);c(e.cx("icon")),i("ngClass",e.icon)}}function G(t,s){if(t&1&&(k(0),r(1,H,1,3,"span",2),x()),t&2){let e=l();o(),i("ngIf",e.icon)}}function J(t,s){}function K(t,s){t&1&&r(0,J,0,0,"ng-template")}function L(t,s){if(t&1&&(p(0,"span"),r(1,K,1,0,null,4),u()),t&2){let e=l();c(e.cx("icon")),o(),i("ngTemplateOutlet",e.iconTemplate||e._iconTemplate)}}var U={root:({instance:t})=>["p-tag p-component",{"p-tag-info":t.severity==="info","p-tag-success":t.severity==="success","p-tag-warn":t.severity==="warn","p-tag-danger":t.severity==="danger","p-tag-secondary":t.severity==="secondary","p-tag-contrast":t.severity==="contrast","p-tag-rounded":t.rounded}],icon:"p-tag-icon",label:"p-tag-label"},P=(()=>{class t extends O{name="tag";theme=A;classes=U;static \u0275fac=(()=>{let e;return function(n){return(e||(e=g(t)))(n||t)}})();static \u0275prov=v({token:t,factory:t.\u0275fac})}return t})();var ft=(()=>{class t extends q{styleClass;severity;value;icon;rounded;iconTemplate;templates;_iconTemplate;_componentStyle=T(P);ngAfterContentInit(){this.templates?.forEach(e=>{switch(e.getType()){case"icon":this._iconTemplate=e.template;break}})}static \u0275fac=(()=>{let e;return function(n){return(e||(e=g(t)))(n||t)}})();static \u0275cmp=b({type:t,selectors:[["p-tag"]],contentQueries:function(a,n,_){if(a&1&&(f(_,R,4),f(_,E,4)),a&2){let d;m(d=y())&&(n.iconTemplate=d.first),m(d=y())&&(n.templates=d)}},hostVars:2,hostBindings:function(a,n){a&2&&c(n.cn(n.cx("root"),n.styleClass))},inputs:{styleClass:"styleClass",severity:"severity",value:"value",icon:"icon",rounded:[2,"rounded","rounded",j]},features:[F([P]),C],ngContentSelectors:V,decls:5,vars:5,consts:[[4,"ngIf"],[3,"class",4,"ngIf"],[3,"class","ngClass",4,"ngIf"],[3,"ngClass"],[4,"ngTemplateOutlet"]],template:function(a,n){a&1&&(I(),M(0),r(1,G,2,1,"ng-container",0)(2,L,2,3,"span",1),p(3,"span"),w(4),u()),a&2&&(o(),i("ngIf",!n.iconTemplate&&!n._iconTemplate),o(),i("ngIf",n.iconTemplate||n._iconTemplate),o(),c(n.cx("label")),o(),D(n.value))},dependencies:[Q,S,z,B,N],encapsulation:2,changeDetection:0})}return t})();export{ft as a};
