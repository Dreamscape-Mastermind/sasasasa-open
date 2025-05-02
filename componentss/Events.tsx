import Image from "next/image";
import Link from "next/link";
import poster1 from "../public/images/poster_1.jpeg";


// { id: 1, title: "Summer Music Festival", date: "July 15-17, 2024", image: poster, category: "Music" },
export function Events({ events }) {
  return (
    <div className="mx-auto">
      {events.length && (
        <div
          className="full-w overflow-hidden mx-auto text-center px-10"//200 130
          // data-testid={testIds.PRODUCT_LIST.CONTAINER}
        >
          <ul className="grid sm:grid-cols-3 gap-8 grid-flow-row">
            {events.map((item) => (
              <li
                key={item.id}
                className="relative group transition-transform duration-300 hover:-translate-y-2"
              >
                <Link href={`/event-page/${item.slug}`} className="block overflow-hidden">
                  <div className="h-auto max-w-full overflow-hidden">
                    <Image
                      src={ item.cover_image ? item.cover_image : poster1 }
                      height={560}
                      width={560}
                      alt={'main image'}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <Link
                      className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#CC322D] hover:bg-[#CC322D] text-white px-6 py-2 rounded-full 
                      transition-all duration-300 transform opacity-0 group-hover:opacity-100 shadow-lg"
                      href={`/api/quick-buy/${item._id}?quantity=1`}
                    >
                      Buy Now
                    </Link>
                  </div>
                  
                  {/* <a href={`/event-page/${item.slug}`}>
                    <div className="p-4 text-left">
                      <span className="font-semibold text-lg">{item.title}</span>
                      <br />
                      <span className="text-sm text-gray-600">
                        {item.date}
                      </span>
                    </div>
                  </a> */}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) 
      // : (
      //   <div className="text-3xl w-full text-center p-9 box-borderbox-border max-w-4xl mx-auto">
      //     No events found. Click{' '}
      //     <a
      //       href="#"
      //       target="_blank"
      //       rel="noreferrer"
      //       className="text-purple-500"
      //     >
      //       here
      //     </a>{' '}
      //     to go to the business dashboard to add events. Once added, they will
      //     appear here.
      //   </div>
      // )
      }
    </div>
  );
}
