import { type GeneratedPost } from "../../types/generatedTypes";
import PostProposal from "./PostProposal";
import style from "./PostProposal.module.css";

interface ResultsViewProps {
  data: GeneratedPost;
}

export default function ResultsView({ data }: ResultsViewProps) {
  console.log(data.facebook, "Facxebook");
  return (
    <div className={style.resultComponent}>
      <PostProposal
        platform="facebook"
        contentData={data.facebook}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        platform="linkedin"
        contentData={data.linkedin}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        platform="wykop"
        contentData={data.wykop}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        platform="reddit"
        contentData={data.reddit}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />

      <PostProposal
        platform="discord"
        contentData={data.discord}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        platform="telegram"
        contentData={data.telegram}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        platform="x"
        contentData={data.x}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
    </div>
  );
}
