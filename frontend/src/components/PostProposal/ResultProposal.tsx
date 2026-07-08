import { type GeneratedPost } from "../../types/generatedTypes";
import PostProposal from "./PostProposal";
import style from "./PostProposal.module.css";

interface ResultsViewProps {
  data: GeneratedPost;
}

export default function ResultsView({ data }: ResultsViewProps) {
  return (
    <div className={style.resultComponent}>
      <PostProposal
        id={data._id}
        platform="facebook"
        contentData={data.facebook}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        id={data._id}
        platform="linkedin"
        contentData={data.linkedin}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        id={data._id}
        platform="wykop"
        contentData={data.wykop}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        id={data._id}
        platform="reddit"
        contentData={data.reddit}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />

      <PostProposal
        id={data._id}
        platform="discord"
        contentData={data.discord}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        id={data._id}
        platform="telegram"
        contentData={data.telegram}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
      <PostProposal
        id={data._id}
        platform="x"
        contentData={data.x}
        globalLink={data.link}
        globalImage={data.imageUrl}
      />
    </div>
  );
}
