import React from "react";

export const TechIcons: Record<string, React.ReactNode> = {
  "Next.js": (
    <svg
      viewBox="0 0 180 180"
      width="14"
      height="14"
      className="text-black dark:text-white"
      fill="currentColor"
    >
      <mask
        height="180"
        id="mask0_408_134"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
        width="180"
        x="0"
        y="0"
      >
        <circle cx="90" cy="90" fill="black" r="90"></circle>
      </mask>
      <g mask="url(#mask0_408_134)">
        <circle cx="90" cy="90" data-circle="true" fill="black" r="90"></circle>
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill="url(#paint0_linear_408_134)"
        ></path>
        <rect
          fill="url(#paint1_linear_408_134)"
          height="72"
          width="12"
          x="115"
          y="54"
        ></rect>
      </g>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_408_134"
          x1="109"
          x2="144.5"
          y1="116.5"
          y2="160.5"
        >
          <stop stopColor="white"></stop>
          <stop offset="1" stopColor="white" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_408_134"
          x1="121"
          x2="120.799"
          y1="54"
          y2="106.875"
        >
          <stop stopColor="white"></stop>
          <stop offset="1" stopColor="white" stopOpacity="0"></stop>
        </linearGradient>
      </defs>
    </svg>
  ),
  React: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-11.5 -10.23174 23 20.46348"
      width="14"
      height="14"
      fill="currentColor"
      className="text-[#61DAFB]"
    >
      <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  Tailwind: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="14"
      height="14"
      viewBox="0 0 48 48"
    >
      <path
        fill="#00acc1"
        d="M24,9.604c-6.4,0-10.4,3.199-12,9.597c2.4-3.199,5.2-4.398,8.4-3.599 c1.826,0.456,3.131,1.781,4.576,3.247C27.328,21.236,30.051,24,36,24c6.4,0,10.4-3.199,12-9.598c-2.4,3.199-5.2,4.399-8.4,3.6 c-1.825-0.456-3.13-1.781-4.575-3.247C32.672,12.367,29.948,9.604,24,9.604L24,9.604z M12,24c-6.4,0-10.4,3.199-12,9.598 c2.4-3.199,5.2-4.399,8.4-3.599c1.825,0.457,3.13,1.781,4.575,3.246c2.353,2.388,5.077,5.152,11.025,5.152 c6.4,0,10.4-3.199,12-9.598c-2.4,3.199-5.2,4.399-8.4,3.599c-1.826-0.456-3.131-1.781-4.576-3.246C20.672,26.764,17.949,24,12,24 L12,24z"
      ></path>
    </svg>
  ),
  TypeScript: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="14"
      height="14"
      viewBox="0 0 48 48"
    >
      <rect width="36" height="36" x="6" y="6" fill="#1976d2"></rect>
      <polygon
        fill="#fff"
        points="27.49,22 14.227,22 14.227,25.264 18.984,25.264 18.984,40 22.753,40 22.753,25.264 27.49,25.264"
      ></polygon>
      <path
        fill="#fff"
        d="M39.194,26.084c0,0-1.787-1.192-3.807-1.192s-2.747,0.96-2.747,1.986 c0,2.648,7.381,2.383,7.381,7.712c0,8.209-11.254,4.568-11.254,4.568V35.22c0,0,2.152,1.622,4.733,1.622s2.483-1.688,2.483-1.92 c0-2.449-7.315-2.449-7.315-7.878c0-7.381,10.658-4.469,10.658-4.469L39.194,26.084z"
      ></path>
    </svg>
  ),
  Vercel: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1155 1000"
      width="14"
      height="14"
      fill="currentColor"
      className="text-black dark:text-white"
    >
      <path d="M577.344 0L1154.69 1000H0L577.344 0Z" />
    </svg>
  ),
  "Design System": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-pink-500"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  Portfolio: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-purple-500"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  DownIcon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 256 256"
      className="size-4"
    >
      <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
    </svg>
  ),
  Motion: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      id="Brand-motion--Streamline-Tabler"
      height="14"
      width="14"
    >
      <desc>Brand Framer Motion Streamline Icon: https://streamlinehq.com</desc>
      <path d="M12 12 4 4v16L20 4v16l-4 -4" strokeWidth="2"></path>
      <path d="m20 12 -8 8 -4 -4" strokeWidth="2"></path>
    </svg>
  ),
  JavaScript: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="14"
      height="14"
      viewBox="0 0 48 48"
    >
      <path fill="#ffd600" d="M6,42V6h36v36H6z"></path>
      <path
        fill="#000001"
        d="M29.538 32.947c.692 1.124 1.444 2.201 3.037 2.201 1.338 0 2.04-.665 2.04-1.585 0-1.101-.726-1.492-2.198-2.133l-.807-.344c-2.329-.988-3.878-2.226-3.878-4.841 0-2.41 1.845-4.244 4.728-4.244 2.053 0 3.528.711 4.592 2.573l-2.514 1.607c-.553-.988-1.151-1.377-2.078-1.377-.946 0-1.545.597-1.545 1.377 0 .964.6 1.354 1.985 1.951l.807.344C36.452 29.645 38 30.839 38 33.523 38 36.415 35.716 38 32.65 38c-2.999 0-4.702-1.505-5.65-3.368L29.538 32.947zM17.952 33.029c.506.906 1.275 1.603 2.381 1.603 1.058 0 1.667-.418 1.667-2.043V22h3.333v11.101c0 3.367-1.953 4.899-4.805 4.899-2.577 0-4.437-1.746-5.195-3.368L17.952 33.029z"
      ></path>
    </svg>
  ),
  "Node.js": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 96 96"
      id="Nodejs-Icon-Alt--Streamline-Svg-Logos"
      height="14"
      width="14"
    >
      <desc>Nodejs Icon Alt Streamline Icon: https://streamlinehq.com</desc>
      <path
        fill="url(#a)"
        d="M50.2308 1.59051c-1.3997-.787346-3.0619-.787346-4.4616 0L8.93902 22.8488c-1.39972.7873-2.18707 2.2745-2.18707 3.8492v42.604c0 1.5747.87483 3.0619 2.18707 3.8492L45.7692 94.4095c1.3997.7873 3.0619.7873 4.4616 0l36.8301-21.2583c1.3998-.7873 2.1871-2.2745 2.1871-3.8492V26.698c0-1.5747-.8748-3.0619-2.1871-3.8492L50.2308 1.59051Z"
      ></path>
      <mask
        id="b"
        width="84"
        height="94"
        x="6"
        y="1"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "luminance" }}
      >
        <path
          fill="#ffffff"
          d="M50.2308 1.59051c-1.3997-.787346-3.0619-.787346-4.4616 0L8.93902 22.8488c-1.39972.7873-2.18707 2.2745-2.18707 3.8492v42.604c0 1.5747.87483 3.0619 2.18707 3.8492L45.7692 94.4095c1.3997.7873 3.0619.7873 4.4616 0l36.8301-21.2583c1.3998-.7873 2.1871-2.2745 2.1871-3.8492V26.698c0-1.5747-.8748-3.0619-2.1871-3.8492L50.2308 1.59051Z"
        ></path>
      </mask>
      <g mask="url(#b)">
        <path
          fill="url(#c)"
          d="M87.1487 22.8485 50.1435 1.59024c-.3499-.17496-.7873-.34993-1.1372-.43741L7.53955 72.1887c.34993.4374.78734.7873 1.22476 1.0497L45.7694 94.4967c1.0498.6124 2.2746.7874 3.4118.4374L88.111 23.7233c-.2625-.3499-.6124-.6124-.9623-.8748Z"
        ></path>
      </g>
      <mask
        id="d"
        width="84"
        height="94"
        x="6"
        y="1"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "luminance" }}
      >
        <path
          fill="#ffffff"
          d="M50.2308 1.59051c-1.3997-.787346-3.0619-.787346-4.4616 0L8.93902 22.8488c-1.39972.7873-2.18707 2.2745-2.18707 3.8492v42.604c0 1.5747.87483 3.0619 2.18707 3.8492L45.7692 94.4095c1.3997.7873 3.0619.7873 4.4616 0l36.8301-21.2583c1.3998-.7873 2.1871-2.2745 2.1871-3.8492V26.698c0-1.5747-.8748-3.0619-2.1871-3.8492L50.2308 1.59051Z"
        ></path>
      </mask>
      <g mask="url(#d)">
        <path
          fill="url(#e)"
          d="M87.2359 73.1513c1.0497-.6124 1.8371-1.6622 2.187-2.7994L48.831 1.06569c-1.0498-.174967-2.1871-.087484-3.1494.52489L8.93896 22.7614 48.5686 95.0219c.5249-.0874 1.1372-.2624 1.6621-.5249l37.0052-21.3457Z"
        ></path>
      </g>
      <defs>
        <linearGradient
          id="a"
          x1="5632.03"
          x2="1594.94"
          y1="1644.76"
          y2="7987.97"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#41873f"></stop>
          <stop offset=".329" stopColor="#418b3d"></stop>
          <stop offset=".635" stopColor="#419637"></stop>
          <stop offset=".932" stopColor="#3fa92d"></stop>
          <stop offset="1" stopColor="#3fae2a"></stop>
        </linearGradient>
        <linearGradient
          id="c"
          x1="3494.39"
          x2="13604.6"
          y1="5184.79"
          y2="-308.085"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".138" stopColor="#41873f"></stop>
          <stop offset=".403" stopColor="#54a044"></stop>
          <stop offset=".714" stopColor="#66b848"></stop>
          <stop offset=".908" stopColor="#6cc04a"></stop>
        </linearGradient>
        <linearGradient
          id="e"
          x1="-344.289"
          x2="8178"
          y1="4702.52"
          y2="4702.52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".092" stopColor="#6cc04a"></stop>
          <stop offset=".286" stopColor="#66b848"></stop>
          <stop offset=".597" stopColor="#54a044"></stop>
          <stop offset=".862" stopColor="#41873f"></stop>
        </linearGradient>
      </defs>
    </svg>
  ),
  MongoDB: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Mongodb-Icon--Streamline-Svg-Logos"
      height="14"
      width="14"
    >
      <desc>Mongodb Icon Streamline Icon: https://streamlinehq.com</desc>
      <path
        fill="#01ec64"
        d="M14.04125 2.869225c-0.986275 -1.17019 -1.8356 -2.3586725 -2.0091 -2.6055125 -0.018275 -0.0182835 -0.045675 -0.0182835 -0.063925 0 -0.173525 0.24684 -1.022825 1.4353225 -2.009125 2.6055125C1.49346 13.666125 11.292425 20.9525 11.292425 20.9525l0.0822 0.05485C11.447675 22.1318 11.630325 23.75 11.630325 23.75h0.730575s0.18265 -1.609075 0.255725 -2.74265l0.082175 -0.064c0.009125 0.00915 9.808125 -7.277225 1.34245 -18.074125Zm-2.04565 17.918675s-0.438325 -0.3748 -0.55705 -0.56675v-0.018375l0.529675 -11.7568c0 -0.036575 0.0548 -0.036575 0.0548 0l0.52965 11.7568v0.018375c-0.1187 0.19195 -0.557075 0.56675 -0.557075 0.56675Z"
        strokeWidth="0.25"
      ></path>
    </svg>
  ),
  Tweeter: (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 512 512"
      className="text-[12px] sm:text-[12px] text-black/75 dark:text-white/80"
      height="2em"
      width="2em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
    </svg>
  ),
  Linkiden: (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 448 512"
      className="text-[12px] sm:text-[12px] text-black/75 dark:text-white/80"
      height="2em"
      width="2em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path>
    </svg>
  ),
  Github: (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 496 512"
      className="text-[12px] sm:text-[12px] text-black/75 dark:text-white/80 "
      height="2em"
      width="2em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
    </svg>
  ),
  TailwindCSS: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="14"
      height="14"
      viewBox="0 0 48 48"
    >
      <path
        fill="#00acc1"
        d="M24,9.604c-6.4,0-10.4,3.199-12,9.597c2.4-3.199,5.2-4.398,8.4-3.599 c1.826,0.456,3.131,1.781,4.576,3.247C27.328,21.236,30.051,24,36,24c6.4,0,10.4-3.199,12-9.598c-2.4,3.199-5.2,4.399-8.4,3.6 c-1.825-0.456-3.13-1.781-4.575-3.247C32.672,12.367,29.948,9.604,24,9.604L24,9.604z M12,24c-6.4,0-10.4,3.199-12,9.598 c2.4-3.199,5.2-4.399,8.4-3.599c1.825,0.457,3.13,1.781,4.575,3.246c2.353,2.388,5.077,5.152,11.025,5.152 c6.4,0,10.4-3.199,12-9.598c-2.4,3.199-5.2,4.399-8.4,3.599c-1.826-0.456-3.131-1.781-4.576-3.246C20.672,26.764,17.949,24,12,24 L12,24z"
      ></path>
    </svg>
  ),
  NextJS: (
    <svg
      viewBox="0 0 180 180"
      width="14"
      height="14"
      className="text-black dark:text-white"
      fill="currentColor"
    >
      <mask
        height="180"
        id="mask0_408_134_alias"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
        width="180"
        x="0"
        y="0"
      >
        <circle cx="90" cy="90" fill="black" r="90"></circle>
      </mask>
      <g mask="url(#mask0_408_134_alias)">
        <circle cx="90" cy="90" data-circle="true" fill="black" r="90"></circle>
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill="url(#paint0_linear_408_134)"
        ></path>
        <rect
          fill="url(#paint1_linear_408_134)"
          height="72"
          width="12"
          x="115"
          y="54"
        ></rect>
      </g>
    </svg>
  ),
  ReactJS: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-11.5 -10.23174 23 20.46348"
      width="14"
      height="14"
      fill="currentColor"
      className="text-[#61DAFB]"
    >
      <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  Express: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-black dark:text-white"
      width="14"
      height="14"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5 4c-2.21 0-4-1.79-4-4h2c0 1.1.9 2 2 2s2-.9 2-2-2-4-4-4-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2z" />
    </svg>
  ),
  GlobeIcon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="text-[14px] text-black/75 dark:text-white/80" height="1em" width="1em"><path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm87.62,96H175.79C174,83.49,159.94,57.67,148.41,42.4A88.19,88.19,0,0,1,215.63,120ZM96.23,136h63.54c-2.31,41.61-22.23,67.11-31.77,77C118.45,203.1,98.54,177.6,96.23,136Zm0-16C98.54,78.39,118.46,52.89,128,43c9.55,9.93,29.46,35.43,31.77,77Zm11.36-77.6C96.06,57.67,82,83.49,80.21,120H40.37A88.19,88.19,0,0,1,107.59,42.4ZM40.37,136H80.21c1.82,36.51,15.85,62.33,27.38,77.6A88.19,88.19,0,0,1,40.37,136Zm108,77.6c11.53-15.27,25.56-41.09,27.38-77.6h39.84A88.19,88.19,0,0,1,148.41,213.6Z"></path></svg>
  )
};
