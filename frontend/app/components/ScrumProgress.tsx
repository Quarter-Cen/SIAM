
    
export default function ScrumProgress() {
  return (
    <>
      <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Scrum Progress
      </h3>
      <div className="p-4">
        <div className="flex items-stretch justify-between gap-4 rounded-lg">
          <div className="flex flex-col gap-1 flex-[2_2_0px]">
            <p className="text-[#60758a] text-sm font-normal leading-normal">Sprint 3</p>
            <p className="text-[#111418] text-base font-bold leading-tight">Current Sprint: Feature Implementation</p>
            <p className="text-[#60758a] text-sm font-normal leading-normal">Tasks Completed: 7/10</p>
          </div>
        </div>
      </div>
    </>
  );
}