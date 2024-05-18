import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import MetaTags from "~/components/Meta/MetaTags";
import { generateSSGHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";

const ProfilePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { username } = props;

  const { data: user } = api.user.getUserByUsername.useQuery(
    { username },
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <>
      <MetaTags title={`${user?.namaSiswa} (@${user?.username})`} />
      <div>
        <p>ID: {user?.id}</p>
        <p>Nama Lengkap: {user?.namaSiswa}</p>
        <p>Username: {user?.username}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<{ username: string }>,
) => {
  const { req, res } = ctx;

  const ssg = await generateSSGHelper({ req, res });
  // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
  const username = ctx.params?.username as string;

  await ssg.user.getUserByUsername.prefetch({
    username,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};
