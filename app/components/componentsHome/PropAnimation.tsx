// components/PropAnimation.tsx
import React from 'react';

interface PropAnimationProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

const PropAnimation: React.FC<PropAnimationProps> = ({
  width = '100%',
  height = '100%',
  className,
}) => {
  return (
    <svg
      viewBox="-256 -256 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      className={className}
    >
      <style>
        {`
          .st0 { fill: white; stroke: black; stroke-width: 2; }
          .st1 { fill: #FF924D; }
          .sand-particle { fill: #FF924D; }
        `}
      </style>

      {/* Círculo delimitador */}
      <circle cx="256" cy="256" r="500" fill="none" stroke="white" strokeWidth="2" />

      {/* Grupo contenedor para rotación */}
      <g id="hourglass">
        {/* Definición de clips */}
        <defs>
          <clipPath id="upper-bulb">
            <path
              d="M386.609,82.09c-0.011,7.239-2.291,14.316-6.709,20.471l-82.752,115.13
                c-5.698,7.922-8.813,17.41-8.813,27.124v0 H223.666v0
                c0-9.714-3.115-19.202-8.824-27.124L132.1,102.561
                c-4.417-6.155-6.708-13.232-6.708-20.471V50.743h261.216V82.09z"
            />
          </clipPath>
          <clipPath id="lower-bulb">
            <path
              d="M315.883,280.84c-2.963-4.136-4.482-8.857-4.482-13.665v0 H200.599v0
                c-0.011,4.808-1.52,9.53-4.483,13.665l-82.752,115.141c-7.154,9.942-11.039,21.783-11.039,33.918v18.358
                h286.033V429.9c0-12.135-3.887-23.976-11.039-33.918L315.883,280.84z"
            />
          </clipPath>
          <clipPath id="neck">
            <rect x="200.599" y="184.815" width="110.802" height="245.085" />
          </clipPath>
        </defs>

        {/* Arena en bulbo superior */}
        <g clipPath="url(#upper-bulb)">
          <rect
            className="st1"
            x="132.1"
            y="50.743"
            width="247.8"
            height="103.125"
            id="upper-sand"
          >
            <animate
              attributeName="height"
              values="103.125;20.625;20.625;103.125"
              keyTimes="0;0.8;0.999;1"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="50.743;195.118;195.118;50.743"
              keyTimes="0;0.8;0.999;1"
              dur="5s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* Arena en bulbo inferior */}
        <g clipPath="url(#lower-bulb)">
          <rect
            className="st1"
            x="132.1"
            y="392.65"
            width="247.8"
            height="37.25"
            id="lower-sand"
          >
            <animate
              attributeName="height"
              values="37.25;93.125;93.125;37.25"
              keyTimes="0;0.8;0.999;1"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="392.65;336.775;336.775;392.65"
              keyTimes="0;0.8;0.999;1"
              dur="5s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* Contorno principal */}
        <path
          className="st0"
          d="M315.883,231.15l82.752-115.13c7.152-9.942,11.039-21.784,11.039-33.93V46.13h23.911V0H78.415v46.13h23.912
            v35.96c0,12.145,3.886,23.988,11.039,33.93l82.752,115.13c2.963,4.136,4.472,8.857,4.483,13.665v22.36
            c-0.011,4.808-1.52,9.53-4.483,13.665l-82.752,115.141c-7.154,9.942-11.039,21.783-11.039,33.918v35.971H78.415V512h355.169
            v-46.129h-23.911V429.9c0-12.135-3.887-23.976-11.039-33.918L315.883,280.84c-2.963-4.136-4.482-8.857-4.482-13.665v-22.36
            C311.401,240.007,312.92,235.286,315.883,231.15z M386.609,461.257H125.393V429.9c0-7.229,2.291-14.317,6.696-20.46l82.753-115.141
            c5.708-7.934,8.824-17.41,8.824-27.124v-22.36c0-9.714-3.115-19.202-8.824-27.124L132.1,102.561
            c-4.417-6.155-6.708-13.232-6.708-20.471V50.743h261.216V82.09c-0.011,7.239-2.291,14.316-6.709,20.471l-82.752,115.13
            c-5.698,7.922-8.813,17.41-8.813,27.124v22.36c0,9.714,3.114,19.19,8.813,27.124l82.763,115.141
            c4.407,6.143,6.686,13.231,6.698,20.46V461.257z"
        />

        {/* Partículas de arena */}
        <g clipPath="url(#neck)">
          <circle className="sand-particle" cx="255.632" cy="190" r="3">
            <animate
              attributeName="cy"
              values="190;430"
              dur="0.5s"
              begin="0s"
              repeatCount="indefinite"
            />
          </circle>
          <circle className="sand-particle" cx="255.632" cy="180" r="3">
            <animate
              attributeName="cy"
              values="180;420"
              dur="0.5s"
              begin="0.1s"
              repeatCount="indefinite"
            />
          </circle>
          <circle className="sand-particle" cx="250.632" cy="200" r="3">
            <animate
              attributeName="cy"
              values="200;440"
              dur="0.5s"
              begin="0.2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle className="sand-particle" cx="260.632" cy="210" r="3">
            <animate
              attributeName="cy"
              values="210;450"
              dur="0.5s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle className="sand-particle" cx="252.632" cy="220" r="3">
            <animate
              attributeName="cy"
              values="220;460"
              dur="0.5s"
              begin="0.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle className="sand-particle" cx="258.632" cy="185" r="3">
            <animate
              attributeName="cy"
              values="185;425"
              dur="0.5s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle className="sand-particle" cx="251.632" cy="195" r="3">
            <animate
              attributeName="cy"
              values="195;435"
              dur="0.5s"
              begin="0.6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle className="sand-particle" cx="259.632" cy="205" r="3">
            <animate
              attributeName="cy"
              values="205;445"
              dur="0.5s"
              begin="0.7s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>

      {/* Animación de rotación */}
      <animateTransform
        xlinkHref="#hourglass"
        attributeName="transform"
        type="rotate"
        values="0 256 256;0 256 256;180 256 256"
        keyTimes="0;0.8;1"
        dur="5s"
        repeatCount="indefinite"
      />
    </svg>
  );
};

export default PropAnimation;