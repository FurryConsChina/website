import { FriendSiteLinks } from "@/constants/staticConfig";
import { keywordGenerator } from "@/utils/meta";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Moderators = [
  {
    id: 1,
    avatar: "https://avatars.githubusercontent.com/u/3956400?v=4",
    link: "https://github.com/PaiJi",
    name: "老毕",
    description: "站长",
  },
  {
    id: 1,
    avatar: "https://avatars.githubusercontent.com/u/110822227?v=4",
    link: "https://github.com/DgHCo3",
    name: "碳",
    description: "编辑",
  },
];

const Contributors = [
  {
    id: 1,
    avatar: "https://avatars.githubusercontent.com/u/41764733?v=4",
    link: "https://github.com/NatsumeRyuhane",
    name: "夏目龙羽真是我的梦中情龙",
    description: "开源贡献者",
  },
  {
    id: 2,
    avatar: "https://avatars.githubusercontent.com/u/10095765?v=4",
    link: "https://github.com/BLumia",
    name: "Gary Wang",
    description: "开源贡献者",
  },
];

export default function About() {
  return (
    <div>
      <div className="">
        <div className="flex justify-center">
          <h2 className="text-lg text-white mb-4 bg-geraldine rounded-full w-fit px-4">
            关于我们
          </h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-slate-500">
          <p className="text-base">
            兽展日历于 2023 年 1
            月开发上线，最早的初衷是建立一个可以在互联网上公开访问、索引的开放兽展信息平台（你也不想在扣扣空间里看宣展对吧？）。
          </p>
          <p>
            我们当前的唯一官方域名是{" "}
            <a
              href="https://furrycons.cn"
              target="_blank"
              rel="noreferrer"
              className="text-red-400 underline"
            >
              furrycons.cn
            </a>
            ，{" "}
            <a
              href="https://furryeventchina.com"
              target="_blank"
              rel="noreferrer"
              className="text-red-400 underline"
            >
              furryeventchina.com
            </a>
            是我们的旧有域名，访问会跳转到前者。
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-center">
          <h2 className="text-lg text-white mb-4 bg-geraldine rounded-full w-fit px-4">
            免责申明
          </h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg text-slate-700 mb-2">致用户</h3>
          <p className="text-slate-500">
            我们的所有信息都基于互联网公开信源的采集，在这一过程中难免发生信息更新不及时/信息错误的情况，请不要基于本站信息作出重要决定，务必在官方通讯渠道进行二次确认。
          </p>

          <h3 className="text-lg text-slate-700 mb-2">致展方</h3>
          <p className="text-slate-500">
            如您需要更新/撤下展会相关内容，请随时联系我们，联系方式见下方。
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-center">
          <h2 className="text-lg text-white mb-4 bg-geraldine rounded-full w-fit px-4">
            数据许可
          </h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-slate-500">
          <p className="text-base">
            您可以联系我们获取接口使用授权，从而构建相关应用，但您需要遵守以下规定：
          </p>
          <ul className="list-disc list-inside">
            <li>不能使用我们的数据构建和兽展日历高度相似的应用。</li>
            <li>在明确处注明数据来源为 兽展日历。</li>
            <li>不得用于商业用途。</li>
            <li>不得与第三方共享数据和接口密钥。</li>
          </ul>
        </div>
      </div>

      <div className="mt-6" id="contact">
        <div className="flex justify-center">
          <h2 className="text-lg text-white mb-4 bg-geraldine rounded-full w-fit px-4">
            联系方式
          </h2>
        </div>
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://qm.qq.com/q/yIpHnyHg5y"
              target="_blank"
              rel="noreferrer"
              className="bg-white rounded-xl shadow-sm p-4 group hover:shadow-md hover:-translate-y-2 hover:bg-red-300 transition duration-300"
            >
              <h3 className="text-lg text-slate-600 mb-2 group-hover:text-white transition duration-300">
                QQ群
              </h3>
              <p className="text-red-400 underline group-hover:text-white transition duration-300">
                630572929
              </p>
            </a>

            <a
              href="mailto:contact@furrycons.cn"
              target="_blank"
              rel="noreferrer"
              className="bg-white rounded-xl shadow-sm p-4 group hover:shadow-md hover:-translate-y-2 hover:bg-red-300 transition duration-300"
            >
              <h3 className="text-lg text-slate-600 mb-2 group-hover:text-white transition duration-300">
                邮箱
              </h3>
              <p className="text-red-400 underline group-hover:text-white transition duration-300">
                contact@furrycons.cn
              </p>
            </a>
          </div>
        </div>
      </div>

      <div className="my-6">
        <div className="flex justify-center">
          <h2 className="text-lg text-white mb-4 bg-geraldine rounded-full w-fit px-4">
            贡献者
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Moderators.map((moderator) => (
            <a
              key={moderator.id}
              href={moderator.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center flex-col bg-white rounded-xl p-4 hover:bg-red-300 transition duration-300 group hover:shadow-md hover:-translate-y-2"
            >
              <img
                src={moderator.avatar}
                alt={moderator.name}
                className="w-20 h-20 rounded-full"
              />
              <h3 className="text-lg text-slate-600 font-bold mt-2 group-hover:text-white transition duration-300">
                {moderator.name}
              </h3>
              <p className="text-slate-500 m-0 p-0 group-hover:text-white transition duration-300">
                {moderator.description}
              </p>
            </a>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {Contributors.map((contributor) => (
            <a
              key={contributor.id}
              href={contributor.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center flex-col bg-white rounded-xl p-4 group hover:shadow-md hover:-translate-y-2 hover:bg-red-300 transition duration-300"
            >
              <img
                src={contributor.avatar}
                alt={contributor.name}
                className="w-20 h-20 rounded-full"
              />
              <h3 className="text-lg text-slate-600 font-bold mt-2 group-hover:text-white transition duration-300">
                {contributor.name}
              </h3>
              <p className="text-slate-500 m-0 p-0 group-hover:text-white transition duration-300">
                {contributor.description}
              </p>
            </a>
          ))}
        </div>
      </div>

      <div className="my-6">
        <div className="flex justify-center">
          <h2 className="text-lg text-white mb-4 bg-geraldine rounded-full w-fit px-4">
            特别鸣谢
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <a
              href="https://srk.games/?utm_source=fcc"
              target="_blank"
              rel="noreferrer"
              className="text-lg text-red-400 underline font-bold mt-2"
            >
              兽人控游戏库 SRK.Games
            </a>
            <p className="text-slate-500">
              本站在日常运营过程中使用了来自 兽人控游戏库 的基础设施：Umami 和
              Sentry。
            </p>
          </div>
        </div>
      </div>

      <div className="my-6">
        <div className="flex justify-center">
          <h2 className="text-lg text-white mb-4 bg-geraldine rounded-full w-fit px-4">
            友情链接
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {FriendSiteLinks.map((link) => (
            <div key={link.link} className="bg-white rounded-xl shadow-sm p-4">
              <a
                href={link.link}
                target="_blank"
                rel="noreferrer"
                className="text-lg text-red-400 underline font-bold mt-2"
              >
                {link.label}
              </a>
              <p className="text-slate-500 m-0 p-0">{link.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      headMetas: {},
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 500,
  };
}
