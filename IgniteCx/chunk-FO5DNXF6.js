import{$a as v,eb as b,hb as M,s as k}from"./chunk-RWRBDO2X.js";import{C as i,Ib as h,Ja as s,Ra as g,Sa as m,Ta as u,ca as l,d as a,i as p,p as c,qa as d,qb as y,tb as o,ua as f}from"./chunk-M4OIVNYR.js";var D=`
    .p-progressspinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }

    .p-progressspinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .p-progressspinner-spin {
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        animation: p-progressspinner-rotate 2s linear infinite;
    }

    .p-progressspinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: dt('progressspinner.colorOne');
        animation:
            p-progressspinner-dash 1.5s ease-in-out infinite,
            p-progressspinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes p-progressspinner-rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes p-progressspinner-dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
    @keyframes p-progressspinner-color {
        100%,
        0% {
            stroke: dt('progressspinner.color.one');
        }
        40% {
            stroke: dt('progressspinner.color.two');
        }
        66% {
            stroke: dt('progressspinner.color.three');
        }
        80%,
        90% {
            stroke: dt('progressspinner.color.four');
        }
    }
`;var S={root:()=>["p-progressspinner"],spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},F=(()=>{class n extends b{name="progressspinner";theme=D;classes=S;static \u0275fac=(()=>{let r;return function(e){return(r||(r=i(n)))(e||n)}})();static \u0275prov=a({token:n,factory:n.\u0275fac})}return n})();var q=(()=>{class n extends M{styleClass;strokeWidth="2";fill="none";animationDuration="2s";ariaLabel;_componentStyle=p(F);static \u0275fac=(()=>{let r;return function(e){return(r||(r=i(n)))(e||n)}})();static \u0275cmp=d({type:n,selectors:[["p-progressSpinner"],["p-progress-spinner"],["p-progressspinner"]],hostVars:7,hostBindings:function(t,e){t&2&&(s("aria-label",e.ariaLabel)("role","progressbar")("data-pc-name","progressspinner")("data-pc-section","root")("aria-busy",!0),o(e.cn(e.cx("root"),e.styleClass)))},inputs:{styleClass:"styleClass",strokeWidth:"strokeWidth",fill:"fill",animationDuration:"animationDuration",ariaLabel:"ariaLabel"},features:[h([F]),f],decls:2,vars:9,consts:[["viewBox","25 25 50 50"],["cx","50","cy","50","r","20","stroke-miterlimit","10"]],template:function(t,e){t&1&&(c(),g(0,"svg",0),u(1,"circle",1),m()),t&2&&(o(e.cx("spin")),y("animation-duration",e.animationDuration),s("data-pc-section","root"),l(),o(e.cx("circle")),s("fill",e.fill)("stroke-width",e.strokeWidth))},dependencies:[k,v],encapsulation:2,changeDetection:0})}return n})();export{q as a};
