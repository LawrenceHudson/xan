export const DEFAULT_ABOUT = {
  bio: `Xander Hudson is a freelance multidisciplinary illustrator and high school student living in the Upper Valley area. A senior at Lebanon High School and prospective art college student for Fall 2027, they spend most of their days washing ink and paint out of their clothes after long hours invested in the school art room.

Xander’s work explores multi-medium illustrations using traditional pen and brush ink, alcohol markers, colored pencils, and acrylic paint markers, while frequently venturing into exploring other mediums, such as ceramics or mono-medium painting. Driven by vibrant colors, figurative expressionism, and fantastical absurdism, their visual language pulls inspiration from the outsider art movement.

Their illustrative output spans large-scale projects, including illustrating the children's book Gersnuzzles Eat Puzzles by Neal Harris, as well as independent graphic stories. Xander attended the Maine College of Art & Design (MECA&D) 2026 Summer Pre-College program, majoring in painting and sequential illustration, and was awarded Lebanon High School’s Art Award for excellence in both 2024 and 2026. Their piece, "NUCLEAR FAMILY," was featured in the 2026 annual regional high school exhibition at the AVA Gallery and received coverage from the Valley News.`,
  statement: `My work lives in the space between play and critique, often described as post-pop, illustrative, and reminiscent of figurative expressionism. While my mediums shift, ranging from traditional pen and brush ink, acrylics, and watercolor to collage, alcohol markers, and digital tools, the absolute through-line of my portfolio is an unyielding use of vibrant color. I embrace tactile, physical materials for their capacity to introduce a sense of unpredictable energy into my pieces, further emphasizing the humanity captured in each.

At its core, my practice centers on humans, their connections, and their disconnections. On the surface, my imagery is often silly, bizarre, and rooted in the fantastical; I constantly return to monsters, ghouls, and imaginative worlds that parallel and foil our own. Beneath the absurdities and ironies, however, lies intentional commentary on topics that affect or provoke me such as domesticity, capitalism, or hedonism.

Much of this perspective stems from my upbringing in an expansive, tight-knit family filled with conflicting ideologies and lifestyles bound together by traditional ties. Observing these dynamics shaped my nuanced view of people. My environment directly feeds this work, serving as a backdrop for exploring how we attempt to relate to one another.

I make art to provoke emotion, challenge my own technical limits, and start an honest, if occasionally ridiculous, conversation with the viewer. The best advice I ever received was simply to "make something stupid," and I lean into that freedom without reservation. Whether crafting narratively complex personal works or taking on client collaborations that demand sharp problem-solving within specific parameters, I approach every project driven by curiosity, innovation, and a desire to make something genuinely engaging.`,
  cv: [],
};

export function newCvEntry() {
  return { id: `cv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, year: '', title: '', organization: '', details: '', link: '' };
}
